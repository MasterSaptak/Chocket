'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from './ProductCard';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('chocket_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Defer state update to avoid cascading renders warning
        requestAnimationFrame(() => {
          setItems(parsed);
          setIsInitialized(true);
        });
      } catch (error) {
        console.error('Failed to parse cart from local storage:', error);
        requestAnimationFrame(() => setIsInitialized(true));
      }
    } else {
      requestAnimationFrame(() => setIsInitialized(true));
    }
  }, []);

  // Save to local storage whenever items change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('chocket_cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = (product: Product, quantity = 1) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);
      if (existingItemIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }
      return [...prevItems, { product, quantity }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
