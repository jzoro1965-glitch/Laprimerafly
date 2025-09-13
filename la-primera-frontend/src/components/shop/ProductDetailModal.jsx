// src/components/shop/ProductDetailModal.jsx 
import { useState, useEffect } from 'react';
import { formatPrice } from './utils/Formatters';
import RatingStars from './RatingStars';
import SizeChartImage from "../../assets/img/size-chart.png";


const ProductDetailModal = ({ product, onClose, addToCart, isAddingToCart, showNotification }) => {
    if (!product) return null;

    // Handle size variants - menggunakan data dari database
    const sizeVariants = product.size_variants || [];
    const productColors = product.colors || '';
    const initialImages = product.images || [];

    // Debug: Log the received product data
    console.log('Product received:', product);
    console.log('Size variants from product:', sizeVariants);

    // FIXED: Check if size_variants exists and has data
if (!sizeVariants || sizeVariants.length === 0) {
    console.warn('No size variants found for product:', product.name);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Data Produk Tidak Lengkap</h3>
                <p className="text-gray-600">
                    Produk ini belum memiliki data varian ukuran. Silakan hubungi administrator.
                </p>

                <button
                    onClick={onClose}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 mt-6"
                >
                    Tutup
                </button>
            </div>
        </div>
    );
}


    // FIXED: Use the actual size variants from API response
    const actualSizeVariants = sizeVariants;
    
    // FIXED: Get available sizes from database data
    const availableSizes = actualSizeVariants.map(variant => variant.size);

    console.log('Using size variants:', actualSizeVariants);
    console.log('Available sizes:', availableSizes);

    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedSizeStock, setSelectedSizeStock] = useState(null);
    
    // Reset state when product changes
    useEffect(() => {
        console.log('Product changed, resetting state. Product:', product);
        console.log('Size variants:', actualSizeVariants);
        setSelectedSize('');
        setQuantity(1);
        setActiveImageIndex(0);
        setSelectedSizeStock(null);
    }, [product?.id]);

    // FIXED: Handle size selection and update stock info
    const handleSizeSelection = (size) => {
        console.log('Size selected:', size);
        console.log('Available size variants:', actualSizeVariants);
        
        setSelectedSize(size);
        setQuantity(1); // Reset quantity when size changes
        
        // FIXED: Find stock for selected size - make sure we're looking at the right property
        const sizeVariant = actualSizeVariants.find(variant => variant.size === size);
        console.log('Found size variant:', sizeVariant);
        
        // FIXED: Access stock_quantity properly
        const stockForSize = sizeVariant ? parseInt(sizeVariant.stock_quantity) : 0;
        console.log('Stock for size', size, ':', stockForSize);
        
        setSelectedSizeStock(stockForSize);
    };

    const handleQuantityChange = (type) => {
        if (type === 'increase') {
            setQuantity(prev => Math.min(prev + 1, selectedSizeStock || 0)); 
        } else {
            setQuantity(prev => Math.max(prev - 1, 1));
        }
    };

    const getProductName = (product) => {
        return product?.name || product?.title || product?.productName || 'Produk';
    };

    const handleAddToCartClick = async () => {
        // Validation
        if (!selectedSize) {
            showNotification('Harap pilih ukuran produk terlebih dahulu.', 'error');
            return;
        }

        if (quantity <= 0) {
            showNotification('Kuantitas produk harus lebih dari 0.', 'error');
            return;
        }

        if (quantity > (selectedSizeStock || 0)) {
            showNotification(`Stok tidak mencukupi. Stok tersisa: ${selectedSizeStock}`, 'error');
            return;
        }

        if (selectedSizeStock <= 0) {
            showNotification('Stok untuk ukuran ini tidak tersedia.', 'error');
            return;
        }

        const productOptions = [{ name: 'Ukuran', value: selectedSize }];

        const payload = {
            product_id: product.id,
            quantity: quantity,
            product_options: productOptions,
        };
        
        try {
            await addToCart(payload);
            onClose();
            
            const productName = getProductName(product);
            const optionsText = ` (${productOptions.map(opt => `${opt.name}: ${opt.value}`).join(', ')})`;
            showNotification(`${productName}${optionsText} berhasil ditambahkan ke keranjang!`, 'success');
            
        } catch (error) {
            console.error('Error adding to cart from modal:', error);
            showNotification(error.message || 'Gagal menambahkan produk ke keranjang.', 'error');
        }
    };

    const isAddToCartDisabled = isAddingToCart || 
                                !selectedSize || 
                                quantity <= 0 || 
                                quantity > (selectedSizeStock || 0) ||
                                (selectedSizeStock || 0) <= 0;

    // Debug: Log current state
    console.log('Current state:', {
        selectedSize,
        selectedSizeStock,
        sizeVariants: actualSizeVariants,
        availableSizes
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full p-2 z-10"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="relative overflow-hidden rounded-xl">
                                <img 
                                    src={initialImages[activeImageIndex]?.image_path || '/placeholder-image.jpg'} 
                                    alt={getProductName(product)} 
                                    className="w-full h-96 object-cover"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                            </div>
                            {initialImages.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto">
                                    {initialImages.map((image, index) => (
                                        <button 
                                            key={image.id || index}
                                            onClick={() => setActiveImageIndex(index)} 
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                                                activeImageIndex === index ? 'border-red-600' : 'border-gray-200'
                                            }`}
                                        >
                                            <img 
                                                src={image.image_path || '/placeholder-image.jpg'} 
                                                alt={`${getProductName(product)} ${index + 1}`} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{getProductName(product)}</h1>
                                
                                {product.brand && (
                                    <p className="text-lg text-gray-600 mb-2">Brand: <span className="font-medium">{product.brand}</span></p>
                                )}
                                
                                {product.sku && (
                                    <p className="text-sm text-gray-500 mb-3">SKU: {product.sku}</p>
                                )}
                                
                                <div className="flex items-center gap-4">
                                    <RatingStars rating={product.rating_average || 0} />
                                    <span className="text-lg font-medium text-gray-900">
                                        {(product.rating_average || 0).toFixed(1)}
                                    </span>
                                    <span className="text-gray-600">({product.rating_count || 0} ulasan)</span>
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-bold text-red-600">{formatPrice(product.price)}</span>
                            </div>

                            {/* Short Description */}
                            {product.short_description && (
                                <div>
                                    <p className="text-gray-600 leading-relaxed text-lg">{product.short_description}</p>
                                </div>
                            )}

                            {/* Full Description */}
                            {product.description && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Deskripsi Lengkap</h3>
                                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                                </div>
                            )}

                            
                            {/* Size Chart Section */}
                            <div className="mt-6">
                            <h4 className="text-md font-semibold text-gray-900 mb-3 text-center">Size Chart</h4>
                            <div className="flex justify-center">
                                <img
                                src={SizeChartImage}
                                alt="Size Chart"
                                className="w-full max-w-lg rounded-lg border shadow-sm object-contain"
                                />
                            </div>
                            </div>

                            {/* Colors Display */}
                            {product.colors && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Warna Tersedia</h3>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        {product.colors}
                                    </p>
                                </div>
                            )}

                            {/* Size Selection - FIXED: Use actual data from API */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Pilih Ukuran <span className="text-red-600">*</span>
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {actualSizeVariants.map((sizeVariant) => {
                                        const { size, stock_quantity } = sizeVariant;
                                        const sizeStock = parseInt(stock_quantity);
                                        const isAvailable = sizeStock > 0;
                                        
                                        console.log(`Product ${product.id} - Size ${size}: stock=${sizeStock}, available=${isAvailable}`);
                                        
                                        return (
                                            <button 
                                                key={`${product.id}-${size}`}
                                                type="button"
                                                onClick={() => {
                                                    console.log(`Clicked size: ${size} for product ${product.id}`);
                                                    if (isAvailable) {
                                                        handleSizeSelection(size);
                                                    }
                                                }} 
                                                disabled={!isAvailable}
                                                className={`
                                                    px-6 py-3 rounded-lg border-2 font-medium 
                                                    transition-all duration-200 relative
                                                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
                                                    ${selectedSize === size 
                                                        ? 'border-red-600 bg-red-600 text-white shadow-lg transform scale-105' 
                                                        : isAvailable
                                                            ? 'border-gray-300 bg-white text-gray-700 hover:border-red-600 hover:text-red-600 hover:shadow-md cursor-pointer active:bg-red-50'
                                                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                <span className="block">{size}</span>
                                                <span className="text-xs block mt-1">({sizeStock} stok)</span>
                                                {!isAvailable && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="w-full h-0.5 bg-gray-400 transform rotate-45"></div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {!selectedSize && (
                                    <p className="text-sm text-red-600 mt-2">Silakan pilih ukuran untuk melihat stok</p>
                                )}
                                
                            </div>

                            {/* Stock Information - Only show when size is selected */}
                            {selectedSize && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Stok untuk ukuran {selectedSize}</h4>
                                            <p className={`text-lg font-semibold mt-1 ${
                                                selectedSizeStock > 10 ? 'text-green-600' : 
                                                selectedSizeStock > 0 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                                {selectedSizeStock} unit tersedia
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {selectedSizeStock <= 5 && selectedSizeStock > 0 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Stok Terbatas
                                                </span>
                                            )}
                                            {selectedSizeStock <= 0 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Habis
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selection - Only show when size is selected and stock > 0 */}
                            {selectedSize && selectedSizeStock > 0 && (
                                <div className="flex items-center gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Jumlah</h3>
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button 
                                                onClick={() => handleQuantityChange('decrease')} 
                                                className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                                disabled={quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="px-4 py-2 font-medium text-gray-900 border-x border-gray-300 min-w-[60px] text-center">
                                                {quantity}
                                            </span>
                                            <button 
                                                onClick={() => handleQuantityChange('increase')} 
                                                className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                                disabled={quantity >= selectedSizeStock}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Selection Summary - Only show when size is selected */}
                            {selectedSize && selectedSizeStock > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Pilihan Anda:</h4>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>Ukuran: <span className="font-medium text-gray-900">{selectedSize}</span></p>
                                        <p>Jumlah: <span className="font-medium text-gray-900">{quantity} unit</span></p>
                                        <p className="text-lg font-bold text-red-600 mt-2">
                                            Total: {formatPrice(product.price * quantity)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={handleAddToCartClick}
                                    disabled={isAddToCartDisabled}
                                    className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-300 transform shadow-lg ${
                                        isAddToCartDisabled
                                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                            : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 shadow-red-600/25'
                                    }`}
                                >
                                    {isAddingToCart ? 'Menambahkan...' : 
                                     !selectedSize ? 'Pilih Ukuran Dulu' :
                                     selectedSizeStock <= 0 ? 'Stok Habis' :
                                     'Tambah ke Keranjang'}
                                </button>
                                <button 
                                    className="border border-gray-300 text-gray-700 py-4 px-4 rounded-xl hover:border-red-600 hover:text-red-600 transition-colors duration-300" 
                                    aria-label="Add to Wishlist"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Physical Attributes */}
                            {(product.weight || product.dimensions) && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Spesifikasi Fisik</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                        {product.weight && (
                                            <div>
                                                <span className="font-medium">Berat:</span> {product.weight} kg
                                            </div>
                                        )}
                                        {product.dimensions && (
                                            <div>
                                                <span className="font-medium">Dimensi:</span> {product.dimensions} cm
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Product Tags/Status */}
                            <div className="flex flex-wrap gap-2">
                                {product.is_featured && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Featured
                                    </span>
                                )}
                                {product.is_digital && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Digital
                                    </span>
                                )}
                                {selectedSize && selectedSizeStock > 0 && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Tersedia
                                    </span>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;