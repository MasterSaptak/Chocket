import type {
  Product,
  LegacyProduct,
  ProductPricing,
  Currency,
  CurrencyPrice,
  ProductDiscount,
  ProductMarketPricing,
  ProductIntakeDraft,
} from '@/types';

const DEFAULT_CURRENCY: Currency = 'INR';
const DEFAULT_MARKET_ID = 'primary-market';

function toCurrencyPrice(amount: number, currency: Currency = DEFAULT_CURRENCY): CurrencyPrice {
  return {
    amount,
    currency,
  };
}

function buildDiscount(listPrice: number, customerPrice: number): ProductDiscount | undefined {
  if (listPrice <= customerPrice) {
    return undefined;
  }

  return {
    type: 'flat',
    value: Math.round((listPrice - customerPrice) * 100) / 100,
    isActive: true,
  };
}

function buildPrimaryMarket(
  currency: Currency,
  listPrice: number,
  sellingPrice: number,
  customerPrice: number,
  id: string = DEFAULT_MARKET_ID
): ProductMarketPricing {
  return {
    id,
    marketName: currency,
    marketCode: currency,
    currency,
    listPrice,
    sellingPrice,
    customerPrice,
    discount: buildDiscount(listPrice, customerPrice),
  };
}

export function getDefaultMarket(product: Product): ProductMarketPricing {
  return product.markets.find(market => market.id === product.defaultMarketId) ?? product.markets[0];
}

export function getProductDisplayPricing(product: Product) {
  const market = getDefaultMarket(product);

  return {
    market,
    procurement: product.pricing.buying,
    wholesale: product.wholesale,
    selling: toCurrencyPrice(market?.sellingPrice ?? product.pricing.selling.amount, market?.currency ?? product.pricing.selling.currency),
    customer: toCurrencyPrice(market?.customerPrice ?? product.pricing.selling.amount, market?.currency ?? product.pricing.selling.currency),
    list: toCurrencyPrice(market?.listPrice ?? product.pricing.base.amount, market?.currency ?? product.pricing.base.currency),
    discount: market?.discount ?? buildDiscount(market?.listPrice ?? 0, market?.customerPrice ?? 0),
  };
}

export function isProductIntakeDraft(product: any): product is ProductIntakeDraft {
  return Boolean(
    product &&
    typeof product.name === 'string' &&
    typeof product.category === 'string' &&
    typeof product.originCountry === 'string' &&
    product.originMrp &&
    typeof product.originMrp.amount === 'number' &&
    typeof product.originMrp.currency === 'string'
  );
}

export function intakeToEnhanced(intake: ProductIntakeDraft): Product {
  const market = buildPrimaryMarket(
    intake.originMrp.currency,
    intake.originMrp.amount,
    intake.originMrp.amount,
    intake.originMrp.amount
  );

  return {
    id: 'draft-product',
    sellerId: '',
    name: intake.name,
    brand: 'Chocket',
    description: '',
    pricing: {
      buying: toCurrencyPrice(0, intake.originMrp.currency),
      base: toCurrencyPrice(intake.originMrp.amount, intake.originMrp.currency),
      selling: toCurrencyPrice(intake.originMrp.amount, intake.originMrp.currency),
    },
    wholesale: toCurrencyPrice(intake.originMrp.amount, intake.originMrp.currency),
    markets: [market],
    defaultMarketId: market.id,
    images: intake.mainImageUrl ? [intake.mainImageUrl] : [],
    category: intake.category,
    stock: 0,
    rating: 0,
    reviews: 0,
    status: 'live',
    approvedBy: '',
    supplyChain: {
      originCountry: intake.originCountry,
      procurementCountry: intake.originCountry,
    },
    createdAt: intake.createdAt || new Date().toISOString(),
    updatedAt: intake.updatedAt || intake.createdAt || new Date().toISOString(),
  };
}

/**
 * Convert legacy product format to new multi-currency format
 */
export function legacyToEnhanced(legacy: LegacyProduct): Product {
  const procurementCurrency = DEFAULT_CURRENCY;
  const primaryMarket = buildPrimaryMarket(
    procurementCurrency,
    legacy.originalPrice || legacy.price,
    legacy.price,
    legacy.price
  );
  const pricing: ProductPricing = {
    buying: {
      amount: legacy.buyingPrice || 0,
      currency: procurementCurrency,
    },
    base: {
      amount: primaryMarket.listPrice,
      currency: procurementCurrency,
    },
    selling: {
      amount: primaryMarket.customerPrice,
      currency: procurementCurrency,
    },
  };

  return {
    id: legacy.id,
    sellerId: legacy.sellerId || '',
    name: legacy.name,
    brand: 'Chocket',
    description: legacy.description || '',
    pricing,
    wholesale: toCurrencyPrice(legacy.price, procurementCurrency),
    markets: [primaryMarket],
    defaultMarketId: primaryMarket.id,
    images: legacy.images || [],
    category: legacy.category,
    stock: legacy.stock || 0,
    rating: legacy.rating,
    reviews: legacy.reviews,
    isBestSeller: legacy.isBestSeller,
    isNew: legacy.isNew,
    status: 'live',
    approvedBy: legacy.approvedBy || '',
    bypass: legacy.bypass,
    supplyChain: {
      originCountry: 'India',
      procurementCountry: 'India',
    },
    updatedAt: legacy.updatedAt || new Date().toISOString(),
    createdAt: legacy.createdAt || new Date().toISOString(),
  };
}

/**
 * Convert enhanced product format to legacy format for backward compatibility
 */
export function enhancedToLegacy(enhanced: Product): LegacyProduct {
  const pricing = getProductDisplayPricing(enhanced);

  return {
    id: enhanced.id,
    sellerId: enhanced.sellerId,
    name: enhanced.name,
    description: enhanced.description,
    price: pricing.customer.amount,
    buyingPrice: pricing.procurement.amount,
    originalPrice: pricing.list.amount,
    images: enhanced.images,
    category: enhanced.category,
    stock: enhanced.stock,
    rating: enhanced.rating,
    reviews: enhanced.reviews,
    isNew: enhanced.isNew,
    isBestSeller: enhanced.isBestSeller,
    status: enhanced.status,
    approvedBy: enhanced.approvedBy,
    bypass: enhanced.bypass,
    createdAt: enhanced.createdAt,
    updatedAt: enhanced.updatedAt,
  };
}

/**
 * Check if a product object is using the legacy format
 */
export function isLegacyProduct(product: any): product is LegacyProduct {
  return typeof product.price === 'number' && !product.pricing;
}

/**
 * Normalize product to enhanced format regardless of input format
 */
export function normalizeProduct(product: any): Product {
  if (isLegacyProduct(product)) {
    return legacyToEnhanced(product);
  }

  if (isProductIntakeDraft(product)) {
    return intakeToEnhanced(product);
  }

  const normalized = product as Product;
  const markets = normalized.markets?.length
    ? normalized.markets.map((market, index) => ({
        ...market,
        id: market.id || `market-${index + 1}`,
        marketName: market.marketName || market.marketCode || market.currency,
        marketCode: market.marketCode || market.marketName || market.currency,
        currency: market.currency || normalized.pricing?.selling?.currency || DEFAULT_CURRENCY,
        listPrice: typeof market.listPrice === 'number' ? market.listPrice : normalized.pricing?.base?.amount || 0,
        sellingPrice: typeof market.sellingPrice === 'number' ? market.sellingPrice : normalized.pricing?.selling?.amount || 0,
        customerPrice: typeof market.customerPrice === 'number' ? market.customerPrice : normalized.pricing?.selling?.amount || 0,
        discount: market.discount || buildDiscount(
          typeof market.listPrice === 'number' ? market.listPrice : normalized.pricing?.base?.amount || 0,
          typeof market.customerPrice === 'number' ? market.customerPrice : normalized.pricing?.selling?.amount || 0
        ),
      }))
    : [
        buildPrimaryMarket(
          normalized.pricing?.selling?.currency || DEFAULT_CURRENCY,
          normalized.pricing?.base?.amount || normalized.pricing?.selling?.amount || 0,
          normalized.pricing?.selling?.amount || 0,
          normalized.pricing?.selling?.amount || 0
        ),
      ];

  const defaultMarket = markets.find(market => market.id === normalized.defaultMarketId) ?? markets[0];
  const procurement = normalized.pricing?.buying || toCurrencyPrice(0, defaultMarket.currency);
  const customer = defaultMarket.customerPrice;
  const list = defaultMarket.listPrice;
  const selling = defaultMarket.sellingPrice;

  return {
    ...normalized,
    pricing: {
      buying: procurement,
      base: toCurrencyPrice(list, defaultMarket.currency),
      selling: toCurrencyPrice(customer, defaultMarket.currency),
    },
    wholesale: normalized.wholesale || toCurrencyPrice(selling, defaultMarket.currency),
    markets,
    defaultMarketId: defaultMarket.id,
    supplyChain: {
      originCountry: normalized.supplyChain?.originCountry || 'India',
      procurementCountry: normalized.supplyChain?.procurementCountry || normalized.supplyChain?.originCountry || 'India',
      supplier: normalized.supplyChain?.supplier,
      processingLocation: normalized.supplyChain?.processingLocation,
      certifications: normalized.supplyChain?.certifications,
    },
  };
}