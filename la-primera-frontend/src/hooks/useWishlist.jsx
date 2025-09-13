// src/hooks/useWishlist.jsx 
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { wishlistAPI } from '../utils/api';
import { useAuth } from './useAuth';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
        setWishlistItems([]);
        setWishlistIds(new Set());
        setLoading(false);
        return;
    };
    setLoading(true);
    try {
      const response = await wishlistAPI.getWishlist();
      setWishlistItems(response.data);
      setWishlistIds(new Set(response.data.map(item => item.id)));
    } catch (error) {
      console.error("Gagal memuat wishlist:", error);
      setWishlistItems([]);
      setWishlistIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (product) => {
    if (!isAuthenticated) {
        alert("Silakan login untuk menambahkan produk ke wishlist.");
        return;
    }
    try {
      await wishlistAPI.addToWishlist(product.id);
      // Optimistic update
      setWishlistItems(prev => [...prev, product]);
      setWishlistIds(prev => new Set(prev).add(product.id));
    } catch (error) {
      console.error("Gagal menambah ke wishlist:", error);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      // Optimistic update
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      setWishlistIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } catch (error) {
      console.error("Gagal menghapus dari wishlist:", error);
    }
  };

  const value = {
    wishlistItems,
    wishlistIds,
    loading,
    addToWishlist,
    removeFromWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  return useContext(WishlistContext);
};