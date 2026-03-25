'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Minus, Plus, ShoppingCart, Heart, Share2, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/products';
import { useCart } from '@/components/CartProvider';
import { toast } from 'sonner';

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductPageClient({ product, relatedProducts }: ProductPageClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCart();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://picsum.photos/seed/placeholder/600/600'];

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity} ${product.name} added to cart!`);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} | Chocket Premium`,
      text: product.description?.slice(0, 100) + '...',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard! 📋');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 relative pb-32 md:pb-12">
      <div className="container mx-auto px-6">
        
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-muted-foreground mb-8">
          <ol className="flex items-center space-x-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><span>/</span></li>
            <li><Link href="/shop" className="hover:text-primary transition-colors">Shop</Link></li>
            <li><span>/</span></li>
            <li className="text-primary font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 mb-20">
          
          {/* Image Gallery */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-square rounded-[2rem] overflow-hidden bg-card border border-border shadow-sm"
            >
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                priority
              />
              {discount > 0 && (
                <span className="absolute top-6 left-6 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-full shadow-md z-10">
                  -{discount}% OFF
                </span>
              )}
            </motion.div>
            
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 aspect-square rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === idx ? 'border-accent shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-accent uppercase tracking-wider">{product.category}</span>
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-muted'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-primary">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              <div className="flex items-end gap-4 mb-8 pb-8 border-b border-border">
                <span className="text-4xl font-bold text-primary">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through mb-1">₹{product.originalPrice}</span>
                )}
              </div>

              <p className="text-lg text-[#FFF3E0]/70 mb-8 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>

              {/* Cross-border delivery Estimation */}
              <div className="bg-[#2C1A12]/40 border border-[#D4AF37]/20 rounded-2xl p-4 mb-8 flex items-start gap-4">
                <div className="p-2 bg-[#D4AF37]/10 rounded-full">
                  <span className="text-2xl">🌍</span>
                </div>
                <div>
                  <h4 className="text-[#FFF3E0] font-medium text-sm mb-1">Cross-Border Delivery Available</h4>
                  <p className="text-[#FFF3E0]/60 text-xs text-balance">
                    Estimated delivery to <strong className="text-[#D4AF37]">United States</strong>: 3-5 Business Days. Duties & taxes calculated at checkout.
                  </p>
                </div>
              </div>

              {/* Add to Cart Actions (Desktop) */}
              <div className="hidden md:flex flex-col gap-4 mb-10">
                <div className="flex gap-4">
                  <div className="flex items-center justify-between glass-dark border border-[#D4AF37]/30 rounded-full px-4 py-2 w-32 h-14">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-[#FFF3E0]/60 hover:text-[#D4AF37] transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-lg w-8 text-center text-[#FFF3E0]">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-[#FFF3E0]/60 hover:text-[#D4AF37] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 gold-gradient text-[#1A0F0B] rounded-full h-14 font-semibold text-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:-translate-y-1 active:translate-y-0"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>

                {/* Smart Gifting */}
                <button 
                  onClick={() => {
                    addItem(product, quantity);
                    toast('🎁 Gift added to cart!', { description: 'You can select the occasion and add a message at checkout.' });
                  }}
                  className="flex items-center justify-center gap-2 glass-dark text-[#D4AF37] border border-[#D4AF37]/50 rounded-full h-14 font-medium text-lg hover:bg-[#D4AF37]/10 transition-all"
                >
                  🎁 Send as a Gift
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-t border-[#3E2723]/30">
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-[#1A0F0B]/50 border border-white/5">
                  <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                  <span className="text-xs font-medium text-[#FFF3E0]/80">100% Authentic</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-[#1A0F0B]/50 border border-white/5">
                  <Truck className="w-6 h-6 text-[#D4AF37]" />
                  <span className="text-xs font-medium text-[#FFF3E0]/80">Cold-Chain Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-[#1A0F0B]/50 border border-white/5">
                  <RotateCcw className="w-6 h-6 text-[#D4AF37]" />
                  <span className="text-xs font-medium text-[#FFF3E0]/80">Freshness Guarantee</span>
                </div>
              </div>

            </motion.div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pt-16 border-t border-[#3E2723]/50 mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold text-[#FFF3E0]">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#D4AF37]">{product.rating}</span>
              <div className="flex text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-600'}`} />
                ))}
              </div>
              <span className="text-sm text-[#FFF3E0]/50 ml-2">({product.reviews} reviews)</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="glass-dark border border-white/10 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2C1A12] flex items-center justify-center text-[#D4AF37] font-bold">
                      {i === 1 ? 'JD' : 'SM'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#FFF3E0]">{i === 1 ? 'Jane Doe' : 'Sarah M.'}</p>
                      <p className="text-xs text-[#FFF3E0]/50">United States The {i === 1 ? 'New York' : 'London'}</p>
                    </div>
                  </div>
                  <div className="flex text-[#D4AF37]">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                  </div>
                </div>
                <p className="text-sm text-[#FFF3E0]/80 italic">
                  "Absolutely divine! The packaging felt so premium, and the taste is out of this world. Arrived perfectly chilled despite the international shipping."
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-16 border-t border-[#3E2723]/50">
            <h2 className="text-3xl font-display font-bold text-[#FFF3E0] mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Floating Add to Cart (Mobile) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-[#1A0F0B]/90 backdrop-blur-md border-t border-[#3E2723]/50 z-40 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-between glass-dark border border-white/20 rounded-full px-2 py-1 w-28 h-12">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-[#FFF3E0]/60 hover:text-[#D4AF37]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-semibold text-base w-6 text-center text-[#FFF3E0]">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 text-[#FFF3E0]/60 hover:text-[#D4AF37]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 gold-gradient text-[#1A0F0B] rounded-full h-12 font-semibold text-base shadow-md"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
