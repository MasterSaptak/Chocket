import type {
  Currency,
  Product,
  ProductDiscount,
  ProductExchangeSnapshot,
  ProductInrPricing,
  ProductLandedCostInr,
  ProductMarketPricing,
  ProductOriginTruth,
  ProductPricingInr,
} from '@/types';

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Default snapshot aligned with lib/currency fallbacks (USD→INR, INR→BDT). */
export function getDefaultExchangeSnapshot(): ProductExchangeSnapshot {
  return {
    usdToInr: 83.5,
    eurToInr: 90.8,
    inrToBdt: 1.44,
    lastUpdated: new Date().toISOString(),
    source: 'default',
  };
}

/** Convert an amount in `from` currency to INR using the product snapshot. */
export function convertToInr(amount: number, from: Currency, snap: ProductExchangeSnapshot): number {
  if (from === 'INR') return roundMoney(amount);
  if (from === 'USD') return roundMoney(amount * snap.usdToInr);
  if (from === 'EUR') return roundMoney(amount * snap.eurToInr);
  if (from === 'BDT') return roundMoney(amount / snap.inrToBdt);
  return roundMoney(amount);
}

/** Convert INR to target display currency using the product snapshot. */
export function convertFromInr(amountInr: number, to: Currency, snap: ProductExchangeSnapshot): number {
  if (to === 'INR') return roundMoney(amountInr);
  if (to === 'USD') return roundMoney(amountInr / snap.usdToInr);
  if (to === 'EUR') return roundMoney(amountInr / snap.eurToInr);
  if (to === 'BDT') return roundMoney(amountInr * snap.inrToBdt);
  return roundMoney(amountInr);
}

export function sumLandedCostInr(landed: ProductLandedCostInr): number {
  return roundMoney(
    landed.purchaseCostInr + landed.shippingInr + landed.taxInr + landed.miscInr
  );
}

export function applyDiscountToAmount(amount: number, discount?: ProductDiscount): number {
  if (!discount?.isActive) return roundMoney(amount);
  if (discount.type === 'percentage') {
    return roundMoney(Math.max(0, amount * (1 - discount.value / 100)));
  }
  return roundMoney(Math.max(0, amount - discount.value));
}

/** Effective B2C in INR after discount. */
export function effectiveB2cInr(tier: ProductPricingInr): number {
  return applyDiscountToAmount(tier.b2cPriceInr, tier.discount);
}

export function computeProfitInr(effectiveB2c: number, landedTotalInr: number): number {
  return roundMoney(effectiveB2c - landedTotalInr);
}

export function computeMarginPercent(profitInr: number, effectiveB2c: number): number {
  if (effectiveB2c <= 0) return 0;
  return roundMoney((profitInr / effectiveB2c) * 100);
}

export function buildProductInrPricing(input: {
  originTruth: ProductOriginTruth;
  exchangeSnapshot: ProductExchangeSnapshot;
  landedCost: ProductLandedCostInr;
  tier: ProductPricingInr;
}): ProductInrPricing {
  const convertedMrpInr = convertToInr(
    input.originTruth.originMrp,
    input.originTruth.originCurrency,
    input.exchangeSnapshot
  );
  const landedTotalInr = sumLandedCostInr(input.landedCost);
  const b2cEff = effectiveB2cInr(input.tier);
  const profitInr = computeProfitInr(b2cEff, landedTotalInr);
  const marginPercent = computeMarginPercent(profitInr, b2cEff);

  return {
    originTruth: input.originTruth,
    exchangeSnapshot: input.exchangeSnapshot,
    landedCost: input.landedCost,
    tier: input.tier,
    convertedMrpInr,
    landedTotalInr,
    profitInr,
    marginPercent,
  };
}

function buildDiscountFromListAndCustomer(
  listPrice: number,
  customerPrice: number
): ProductDiscount | undefined {
  if (listPrice <= customerPrice) return undefined;
  return {
    type: 'flat',
    value: roundMoney(listPrice - customerPrice),
    isActive: true,
  };
}

/**
 * Sync `markets`, `pricing`, and `wholesale` from `inrPricing` so cart/legacy paths stay consistent.
 */
export function syncProductFieldsFromInrPricing(product: Product): Product {
  const bundle = product.inrPricing;
  if (!bundle) return product;

  const snap = bundle.exchangeSnapshot;
  const tier = bundle.tier;
  const b2bInr = tier.b2bPriceInr;
  const b2cEffInr = effectiveB2cInr(tier);
  const listInr =
    tier.listPriceInr ??
    (bundle.convertedMrpInr > 0 ? bundle.convertedMrpInr : Math.max(b2cEffInr, tier.b2cPriceInr));

  const markets: ProductMarketPricing[] = (product.markets?.length ? product.markets : []).map(
    (market, index) => {
      const c = market.currency || 'INR';
      const listLocal = convertFromInr(listInr, c, snap);
      const sellingLocal = convertFromInr(b2bInr, c, snap);
      const customerLocal = convertFromInr(b2cEffInr, c, snap);
      return {
        ...market,
        id: market.id || `market-${index + 1}`,
        marketName: market.marketName || market.marketCode || c,
        marketCode: market.marketCode || market.marketName || c,
        currency: c,
        listPrice: listLocal,
        sellingPrice: sellingLocal,
        customerPrice: customerLocal,
        discount: buildDiscountFromListAndCustomer(listLocal, customerLocal),
      };
    }
  );

  if (markets.length === 0) {
    const c: Currency = 'INR';
    markets.push({
      id: product.defaultMarketId || 'primary-market',
      marketName: c,
      marketCode: c,
      currency: c,
      listPrice: listInr,
      sellingPrice: b2bInr,
      customerPrice: b2cEffInr,
      discount: buildDiscountFromListAndCustomer(listInr, b2cEffInr),
    });
  }

  const defaultMarket = markets.find(m => m.id === product.defaultMarketId) ?? markets[0];
  const dmCurrency = defaultMarket.currency;

  return {
    ...product,
    markets,
    defaultMarketId: defaultMarket.id,
    wholesale: {
      amount: convertFromInr(b2bInr, dmCurrency, snap),
      currency: dmCurrency,
    },
    pricing: {
      buying: {
        amount: convertFromInr(bundle.landedCost.purchaseCostInr, dmCurrency, snap),
        currency: dmCurrency,
      },
      base: {
        amount: defaultMarket.listPrice,
        currency: dmCurrency,
      },
      selling: {
        amount: defaultMarket.customerPrice,
        currency: dmCurrency,
      },
    },
  };
}

/** Customer-facing amount in a chosen currency (INR pipeline when bundle exists). */
export function getCustomerPriceInCurrency(
  product: Product,
  targetCurrency: Currency
): { amount: number; currency: Currency } | null {
  const bundle = product.inrPricing;
  if (!bundle) return null;
  const eff = effectiveB2cInr(bundle.tier);
  return {
    amount: convertFromInr(eff, targetCurrency, bundle.exchangeSnapshot),
    currency: targetCurrency,
  };
}

/** List (compare-at) and effective customer price in a display currency. */
export function getListAndCustomerInCurrency(
  product: Product,
  targetCurrency: Currency
): { list: number; customer: number; currency: Currency } | null {
  const bundle = product.inrPricing;
  if (!bundle) return null;
  const snap = bundle.exchangeSnapshot;
  const tier = bundle.tier;
  const listInr =
    tier.listPriceInr ??
    (bundle.convertedMrpInr > 0 ? bundle.convertedMrpInr : tier.b2cPriceInr);
  const custEff = effectiveB2cInr(tier);
  return {
    list: convertFromInr(listInr, targetCurrency, snap),
    customer: convertFromInr(custEff, targetCurrency, snap),
    currency: targetCurrency,
  };
}

export function formatApproxSecondary(
  product: Product,
  primaryCurrency: Currency,
  symbolFor: (c: Currency) => string
): string | null {
  const bundle = product.inrPricing;
  if (!bundle) return null;
  const eff = effectiveB2cInr(bundle.tier);
  const order: Currency[] = ['INR', 'BDT', 'USD', 'EUR'];
  const secondary = order.find(c => c !== primaryCurrency);
  if (!secondary) return null;
  const amt = convertFromInr(eff, secondary, bundle.exchangeSnapshot);
  return `≈ ${symbolFor(secondary)}${amt}`;
}
