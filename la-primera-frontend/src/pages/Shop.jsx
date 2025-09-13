// src/pages/Shop.jsx
import { useState, useEffect } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { productAPI } from '../utils/api'; // Import API untuk fetch detail

import CategoryFilter from '../components/shop/CategoryFilter';
import ProductGrid from '../components/shop/ProductGrid';
import ProductDetailModal from '../components/shop/ProductDetailModal';
import ToastNotification from '../components/common/ToastNotification';

function Shop() {
  const { products, categories, loading, error, activeCategory, setActiveCategory } = useProduct();
  const { wishlistIds, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isAdding } = useCart();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isLoadingProductDetail, setIsLoadingProductDetail] = useState(false);

  useEffect(() => {
    let timer;
    if (notification) {
      timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [notification]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  // Helper function untuk mendapatkan nama produk
  const getProductName = (product) => {
    return product?.name || product?.title || product?.productName || 'Produk';
  };

  // Handler konsisten untuk addToCart dari ProductGrid (quick add)
  const handleAddToCart = async (product, quantity = 1) => {
    try {
      await addToCart(product, quantity);
      const productName = getProductName(product);
      showNotification(`${productName} berhasil ditambahkan ke keranjang!`, 'success');
    } catch (error) {
      showNotification(error.message || 'Gagal menambahkan produk ke keranjang', 'error');
    }
  };

  // Handler konsisten untuk addToCart dari ProductDetailModal (detailed add)
  const handleDetailedAddToCart = async (payload) => {
    try {
      await addToCart(payload);
      // Notifikasi akan ditangani oleh ProductDetailModal
      return { success: true };
    } catch (error) {
      throw error; // Re-throw untuk ditangani oleh ProductDetailModal
    }
  };

  // Wrapper function untuk wishlist dengan notifikasi
  const handleAddToWishlist = async (product) => {
    try {
      await addToWishlist(product);
      const productName = getProductName(product);
      showNotification(`${productName} ditambahkan ke wishlist!`, 'success');
    } catch (error) {
      showNotification(error.message || 'Gagal menambahkan ke wishlist', 'error');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      showNotification('Produk dihapus dari wishlist', 'success');
    } catch (error) {
      showNotification(error.message || 'Gagal menghapus dari wishlist', 'error');
    }
  };

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => 
        product.categories && product.categories.some(cat => cat.slug === activeCategory)
      );

  // FIXED: Fetch product detail when opening modal
  const openProductDetail = async (product) => {
    try {
      setIsLoadingProductDetail(true);
      console.log('Opening product detail for:', product);
      
      // Fetch detailed product data with size_variants and images
      const response = await productAPI.getProduct(product.id);
      console.log('Fetched product detail:', response);
      
      const detailProduct = response.data || response;
      console.log('Setting selected product:', detailProduct);
      
      setSelectedProduct(detailProduct);
      
    } catch (error) {
      console.error('Error fetching product detail:', error);
      showNotification('Gagal memuat detail produk', 'error');
      setSelectedProduct(null);
    } finally {
      setIsLoadingProductDetail(false);
    }
  };
  
  const closeProductDetail = () => { 
    setSelectedProduct(null); 
  };

  if (loading) {
    return <div className="text-center py-20 text-xl">Memuat produk... ⏳</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-xl text-red-600">Error: {error} 😥</div>;
  }

  return (
    <>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
             <span className="text-red-600"></span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            </p>
          </div>

          <CategoryFilter 
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <ProductGrid 
            products={filteredProducts}
            onOpenDetail={openProductDetail}
            wishlistIds={wishlistIds}
            addToWishlist={handleAddToWishlist}
            removeFromWishlist={handleRemoveFromWishlist}
          />

          <div className="text-center mt-12">
            <button className="bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors duration-300 transform hover:scale-105 shadow-lg">
              Lihat Semua Produk
            </button>
          </div>
        </div>
      </section>

      {/* FIXED: Show loading state when fetching product detail */}
      {isLoadingProductDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            <span className="text-gray-700">Memuat detail produk...</span>
          </div>
        </div>
      )}

      <ProductDetailModal 
        product={selectedProduct}
        onClose={closeProductDetail}
        addToCart={handleDetailedAddToCart} // Detailed add handler
        isAddingToCart={isAdding}
        showNotification={showNotification}
      />

      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}

export default Shop;