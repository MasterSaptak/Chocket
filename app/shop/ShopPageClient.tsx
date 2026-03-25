'use client';

import { ProductCard, Product } from '@/components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, ChevronDown, X, Star, IndianRupee, Tag, Check } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ShopPageClientProps {
  initialProducts: Product[];
}

export default function ShopPageClient({ initialProducts }: ShopPageClientProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [minRating, setMinRating] = useState(0);
  const [onlyDiscounts, setOnlyDiscounts] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [activeBrand, setActiveBrand] = useState('All');
  const [activeType, setActiveType] = useState('All');
  
  const categories = ['All', 'Imported', 'Premium', 'Budget', 'Cookies', 'Desserts'];
  const brandsArr = ['All', 'Godiva', 'Lindt', 'Ferrero', 'Valrhona', 'Toblerone', 'Neuhaus'];
  const typesArr = ['All', 'Dark', 'Milk', 'White', 'Truffle', 'Praline', 'Bar'];

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Price Filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Rating Filter
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Discount Filter
    if (onlyDiscounts) {
      result = result.filter(p => p.originalPrice && p.originalPrice > p.price);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

    return result;
  }, [initialProducts, activeCategory, priceRange, minRating, onlyDiscounts, sortBy]);

  const clearFilters = () => {
    setActiveCategory('All');
    setPriceRange([0, 5000]);
    setMinRating(0);
    setOnlyDiscounts(false);
    setSortBy('newest');
    setActiveBrand('All');
    setActiveType('All');
  };

  return (
    <div className="min-h-screen bg-transparent py-12">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-[#FFF3E0] mb-4">
              Our Collection
            </h1>
            <p className="text-[#FFF3E0]/40 text-lg max-w-xl">
              Artisan chocolates from the world&apos;s finest brands — all in one place.
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300 flex-1 md:flex-none ${
                showFilters 
                  ? 'bg-[#D4AF37] text-[#1A0F0B] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20' 
                  : 'border-[#3E2723] bg-[#1A0F0B] text-[#FFF3E0] hover:bg-[#2C1A12]'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
            <div className="relative flex-1 md:flex-none">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-[#3E2723] bg-[#1A0F0B] text-[#FFF3E0] hover:bg-[#2C1A12] transition-colors w-full cursor-pointer pr-10 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#FFF3E0]/40" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-12 p-8 glass-dark rounded-3xl border border-[#3E2723] shadow-2xl overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    <h3>Price Range</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-sm text-[#FFF3E0]/40">
                      <span>₹0</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5000" 
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-1.5 bg-[#3E2723] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                    />
                    <div className="flex gap-2">
                      {[1000, 2000, 5000].map((val) => (
                        <button
                          key={val}
                          onClick={() => setPriceRange([0, val])}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            priceRange[1] === val 
                              ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]' 
                              : 'border-[#3E2723] text-[#FFF3E0]/50 hover:border-[#D4AF37]/30'
                          }`}
                        >
                          &lt; ₹{val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-semibold">
                    <Star className="w-4 h-4" />
                    <h3>Minimum Rating</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[0, 3, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${
                          minRating === rating 
                            ? 'bg-[#D4AF37] text-[#1A0F0B] border-[#D4AF37]' 
                            : 'border-[#3E2723] text-[#FFF3E0]/50 hover:border-[#D4AF37]/30'
                        }`}
                      >
                        {rating === 0 ? 'Any' : (
                          <>
                            <span>{rating}+</span>
                            <Star className={`w-3 h-3 ${minRating === rating ? 'fill-current' : ''}`} />
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Filters */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-semibold">
                    <Tag className="w-4 h-4" />
                    <h3>Special Offers</h3>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                        onlyDiscounts ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[#3E2723] group-hover:border-[#D4AF37]/50'
                      }`}>
                        {onlyDiscounts && <Check className="w-4 h-4 text-[#1A0F0B]" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={onlyDiscounts}
                        onChange={() => setOnlyDiscounts(!onlyDiscounts)}
                      />
                      <span className="text-[#FFF3E0]/50 group-hover:text-[#FFF3E0] transition-colors">On Sale / Discounts</span>
                    </label>
                    
                    <button 
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500 font-medium transition-colors pt-4"
                    >
                      <X className="w-4 h-4" />
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Pills */}
        <div className="flex overflow-x-auto pb-6 -mx-6 px-6 hide-scrollbar gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-[#D4AF37] text-[#1A0F0B] shadow-lg shadow-[#D4AF37]/10'
                  : 'bg-[#1A0F0B] text-[#FFF3E0]/50 border border-[#3E2723] hover:border-[#D4AF37]/30 hover:text-[#D4AF37]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((p, index) => (
            <motion.div
              layout
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-[#1A0F0B]/50 rounded-3xl border border-[#3E2723] shadow-inner">
            <div className="w-20 h-20 bg-[#1A0F0B] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <Filter className="w-10 h-10 text-[#FFF3E0]/20" />
            </div>
            <h3 className="text-2xl font-display text-[#FFF3E0] mb-2">No delicacies found</h3>
            <p className="text-[#FFF3E0]/40 mb-8">Adjust your filters to discover our premium range.</p>
            <button 
              onClick={clearFilters}
              className="px-8 py-3 bg-[#D4AF37] text-[#1A0F0B] rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
