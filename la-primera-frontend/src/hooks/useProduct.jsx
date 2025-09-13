// src/hooks/useProduct.js
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { productAPI, categoryAPI } from '../utils/api';

// 1. Buat Context
const ProductContext = createContext();

// 2. Buat Provider
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsResponse, categoriesResponse] = await Promise.all([
        productAPI.getProducts(),
        categoryAPI.getCategories(),
      ]);
      
      setProducts(productsResponse.data || []);
      
      const allCategories = [{ id: 'all', name: 'Semua Produk', slug: 'all' }, ...(categoriesResponse.data || [])];
      setCategories(allCategories);

    } catch (err) {
      console.error("Gagal mengambil data produk:", err);
      setError(err.message || 'Terjadi kesalahan saat memuat data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = {
    products,
    categories,
    loading,
    error,
    activeCategory,
    setActiveCategory,
    refetchProducts: fetchData,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// 3. Buat hook kustom
export const useProduct = () => {
  return useContext(ProductContext);
};