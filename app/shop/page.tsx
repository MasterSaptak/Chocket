'use client';

import { ProductCard, Product } from '@/components/ProductCard';
import { motion } from 'motion/react';
import { Filter, ChevronDown, X, Star, IndianRupee, Tag, Check } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getAllProducts, seedProductsIfEmpty } from '@/lib/products';

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [minRating, setMinRating] = useState(0);
  const [onlyDiscounts, setOnlyDiscounts] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [activeBrand, setActiveBrand] = useState('All');
  const [activeType, setActiveType] = useState('All');
  
  const categories = ['All', 'Imported', 'Premium', 'Budget', 'Cookies', 'Desserts'];
  const brands = ['All', 'Godiva', 'Lindt', 'Ferrero', 'Valrhona', 'Toblerone', 'Neuhaus'];
  const types = ['All', 'Dark', 'Milk', 'White', 'Truffle', 'Praline', 'Bar'];

  useEffect(() => {
    async function loadProducts() {
      await seedProductsIfEmpty();
      const fetchedProducts = await getAllProducts();
      setAllProducts(fetchedProducts);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

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
      return 0; // Default newest (handled by Firestore order usually, but here we just keep original)
    });

    return result;
  }, [allProducts, activeCategory, priceRange, minRating, onlyDiscounts, sortBy]);

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
    <div className="min-h-screen bg-background py-12">
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
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg' 
                  : 'border-border bg-card text-primary hover:bg-muted'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
            <div className="relative flex-1 md:flex-none">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-border bg-card text-primary hover:bg-muted transition-colors w-full cursor-pointer pr-10"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-12 p-8 bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Price Range */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <IndianRupee className="w-4 h-4" />
                  <h3>Price Range</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="5000" 
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex gap-2">
                    {[500, 1000, 2000, 5000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setPriceRange([0, val])}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          priceRange[1] === val 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'border-border text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        Under ₹{val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
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
                          ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                          : 'border-border text-muted-foreground hover:border-primary/30'
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
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Tag className="w-4 h-4" />
                  <h3>Special Offers</h3>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                      onlyDiscounts ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'
                    }`}>
                      {onlyDiscounts && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={onlyDiscounts}
                      onChange={() => setOnlyDiscounts(!onlyDiscounts)}
                    />
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">On Sale / Discounts</span>
                  </label>
                  
                  <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors pt-4"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Brand & Type Filters — second row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8 pt-8 border-t border-border/30">
              {/* Brand Filter */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Tag className="w-4 h-4" />
                  <h3>Brand</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setActiveBrand(brand)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                        activeBrand === brand
                          ? 'bg-primary text-primary-foreground border-primary shadow-md'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Filter className="w-4 h-4" />
                  <h3>Type</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveType(type)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                        activeType === type
                          ? 'bg-primary text-primary-foreground border-primary shadow-md'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Categories Pills */}
        <div className="flex overflow-x-auto pb-6 -mx-6 px-6 hide-scrollbar gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-4 shadow-md border border-border/50 h-[400px] animate-pulse">
                <div className="w-full h-[60%] bg-muted rounded-xl mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
        
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-card rounded-3xl border border-border/50 shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-display text-primary mb-2">No products found</h3>
            <p className="text-muted-foreground mb-8">Try adjusting your filters or search criteria.</p>
            <button 
              onClick={clearFilters}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
