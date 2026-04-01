'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Heart, Star, Check, Gift, Zap, Eye } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { toast } from 'sonner';
import { SmartImage } from './SmartImage';

export interface Product {
  id: string;
  sellerId?: string;
  name: string;
  description?: string;
  price: number;
  buyingPrice?: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock?: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  status?: string;
  approvedBy?: string;
  bypass?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { addItem } = useCart();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    setIsAdded(true);
    toast.success(`${product.name} added to cart! 🍫`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    toast.success('Redirecting to checkout...', { duration: 1500 });
    window.location.href = '/checkout';
  };

  const handleSendGift = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    toast('🎁 Gift mode activated!', {
      description: 'Add a personal message at checkout.',
      duration: 2500,
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    if (!isLiked) {
      toast('Added to wishlist! ❤️', { duration: 1500 });
    }
  };

  return (
    <motion.div
      className="group relative bg-[#1A0F0B] rounded-2xl overflow-hidden border border-[#3E2723]/50 premium-card-light gloss-reflection"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        y: -8,
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(212, 175, 55, 0.1)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {discount > 0 && (
          <motion.span
            className="bg-[#EF5350] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg tracking-wider"
            animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            -{discount}%
          </motion.span>
        )}
        {product.isNew && (
          <motion.span
            className="gold-gradient text-[#1A0F0B] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg tracking-wider"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            NEW
          </motion.span>
        )}
        {product.isBestSeller && (
          <span className="bg-[#2C1A12] text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg tracking-wider animate-heartbeat">
            ✨ BEST
          </span>
        )}
      </div>

      {/* Wishlist */}
      <motion.button
        onClick={handleLike}
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm border ${
          isLiked
            ? 'bg-red-500/20 text-red-400 border-red-500/30'
            : 'bg-black/30 text-[#FFF3E0]/60 hover:text-red-400 hover:bg-black/50 border-white/10'
        }`}
        whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
        whileTap={{ scale: 0.85 }}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      </motion.button>

      {/* Image */}
      <div onClick={() => window.location.href = `/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-[#2C1A12]/50 cursor-pointer">
        <SmartImage
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0B] via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0B] via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Quick actions overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 left-4 right-4 flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#D4AF37] text-[#1A0F0B] text-xs font-bold hover:bg-[#F9F295] transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                Buy Now
              </button>
              <button
                onClick={handleSendGift}
                className="flex items-center justify-center p-2.5 rounded-xl glass-dark text-[#D4AF37] hover:bg-white/10 transition-colors border border-[#D4AF37]/30"
              >
                <Gift className="w-4 h-4" />
              </button>
              <Link
                href={`/product/${product.id}`}
                className="flex items-center justify-center p-2.5 rounded-xl glass-dark text-[#FFF3E0]/70 hover:bg-white/10 transition-colors border border-white/10"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-[#D4AF37]/60 uppercase tracking-[0.2em] font-medium">
            {product.category}
          </p>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
            <span className="text-[10px] font-medium text-[#FFF3E0]/60">{product.rating}</span>
            <span className="text-[10px] text-[#FFF3E0]/30">({product.reviews})</span>
          </div>
        </div>

        <Link href={`/product/${product.id}`} className="block">
          <h3 className="font-display font-semibold text-lg text-[#FFF3E0] line-clamp-1 group-hover:text-[#D4AF37] transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-[#FFF3E0]/40 text-xs line-clamp-1">{product.description}</p>
        )}

        <div className="flex items-end justify-between pt-2">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-[#FFF3E0]/30 line-through">₹{product.originalPrice}</span>
            )}
            <div className="flex items-center gap-2">
              <motion.span
                className="font-bold text-xl text-[#FFF3E0]"
                animate={isHovered ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                ₹{product.price}
              </motion.span>
              {discount > 0 && (
                <span className="text-[10px] text-[#EF5350] font-medium">SAVE ₹{product.originalPrice! - product.price}</span>
              )}
            </div>
          </div>

          <motion.button
            onClick={handleAddToCart}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border ${
              isAdded
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A0F0B] border-[#D4AF37]/30 hover:border-[#D4AF37]'
            }`}
            whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="cart"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <ShoppingCart className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
