'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { CheckCircle2, CreditCard, Wallet, Truck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { toast } from 'sonner';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import Image from 'next/image';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        userId: auth.currentUser?.uid || 'guest',
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          images: item.product.images,
        })),
        subtotal: totalPrice,
        shipping: totalPrice > 2000 ? 0 : 50,
        totalAmount: totalPrice + (totalPrice > 2000 ? 0 : 50),
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      setIsSuccess(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shippingCost = totalPrice > 2000 ? 0 : 50;
  const finalTotal = totalPrice + shippingCost;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-display font-bold text-primary mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been received and is being processed. We&apos;ll send you an email with the tracking details soon.
          </p>
          <Link 
            href="/shop"
            className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors shadow-md"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-4xl font-display font-bold text-primary mb-8 text-center">Checkout</h1>

        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center w-full max-w-md">
            <div className={`flex flex-col items-center flex-1 relative ${step >= 1 ? 'text-accent' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 z-10 ${step >= 1 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
              <span className="text-xs font-medium">Shipping</span>
            </div>
            <div className={`h-1 flex-1 -mx-4 z-0 ${step >= 2 ? 'bg-accent' : 'bg-muted'}`} />
            <div className={`flex flex-col items-center flex-1 relative ${step >= 2 ? 'text-accent' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 z-10 ${step >= 2 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
              <span className="text-xs font-medium">Payment</span>
            </div>
            <div className={`h-1 flex-1 -mx-4 z-0 ${step >= 3 ? 'bg-accent' : 'bg-muted'}`} />
            <div className={`flex flex-col items-center flex-1 relative ${step >= 3 ? 'text-accent' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 z-10 ${step >= 3 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>3</div>
              <span className="text-xs font-medium">Review</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 bg-card rounded-[2rem] p-8 border border-border shadow-md">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-2">
                  <Truck className="w-6 h-6 text-accent" /> Shipping Address
                </h2>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">First Name</label>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Last Name</label>
                      <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Address</label>
                    <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary" placeholder="123 Sweet Street" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">City</label>
                      <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary" placeholder="Mumbai" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">State</label>
                      <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary" placeholder="MH" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">ZIP / Postal</label>
                      <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary" placeholder="400001" />
                    </div>
                  </div>
                  <button type="submit" className="w-full mt-8 bg-primary text-primary-foreground rounded-full h-14 font-semibold text-lg hover:bg-accent hover:text-accent-foreground transition-all shadow-md">
                    Continue to Payment
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-accent" /> Payment Method
                </h2>
                <div className="space-y-4">
                  <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-accent bg-accent/5' : 'border-border hover:border-primary/30'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-accent focus:ring-accent" />
                      <span className="font-medium text-primary">Credit / Debit Card</span>
                    </div>
                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                  </label>
                  
                  <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-accent bg-accent/5' : 'border-border hover:border-primary/30'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-5 h-5 text-accent focus:ring-accent" />
                      <span className="font-medium text-primary">UPI / Wallets</span>
                    </div>
                    <Wallet className="w-6 h-6 text-muted-foreground" />
                  </label>

                  {paymentMethod === 'card' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Card Number</label>
                        <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary" placeholder="0000 0000 0000 0000" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Expiry Date</label>
                          <input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary" placeholder="MM/YY" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">CVV</label>
                          <input type="text" name="cvv" value={formData.cvv} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary" placeholder="123" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-4 mt-8">
                    <button type="button" onClick={prevStep} className="flex-1 bg-muted text-muted-foreground rounded-full h-14 font-semibold text-lg hover:bg-border transition-all">
                      Back
                    </button>
                    <button type="button" onClick={nextStep} className="flex-1 bg-primary text-primary-foreground rounded-full h-14 font-semibold text-lg hover:bg-accent hover:text-accent-foreground transition-all shadow-md">
                      Review Order
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-accent" /> Review Order
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-background rounded-2xl p-4 border border-border">
                    <h3 className="font-medium text-primary mb-2">Shipping To</h3>
                    <p className="text-sm text-muted-foreground">{formData.firstName} {formData.lastName}<br/>{formData.address}<br/>{formData.city}, {formData.state} {formData.zipCode}</p>
                  </div>

                  <div className="bg-background rounded-2xl p-4 border border-border">
                    <h3 className="font-medium text-primary mb-2">Payment Method</h3>
                    <p className="text-sm text-muted-foreground capitalize">{paymentMethod === 'card' ? `Credit Card ending in ${formData.cardNumber.slice(-4) || '****'}` : 'UPI'}</p>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button type="button" onClick={prevStep} className="flex-1 bg-muted text-muted-foreground rounded-full h-14 font-semibold text-lg hover:bg-border transition-all">
                      Back
                    </button>
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="flex-[2] flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-full h-14 font-semibold text-lg hover:bg-accent/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-card rounded-[2rem] p-6 border border-border shadow-md sticky top-24">
              <h3 className="text-xl font-display font-bold text-primary mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border shrink-0">
                      <Image src={item.product.images[0] || 'https://picsum.photos/seed/placeholder/600/600'} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-primary line-clamp-2 text-sm">{item.product.name}</h4>
                      <div className="text-muted-foreground text-sm mt-1">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-semibold text-primary">
                      ₹{item.product.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-primary">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-primary">{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-lg font-bold text-primary">Total</span>
                  <span className="text-2xl font-bold text-primary">₹{finalTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
