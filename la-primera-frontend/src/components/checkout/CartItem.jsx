// src/components/checkout/CartItem.jsx
import React from 'react';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../shop/utils/Formatters';

function CartItem({ item }) {
  const { updateQuantityInCart, isUpdating } = useCart();

  // Pastikan item.product dan item.product.images ada sebelum diakses
  const imageUrl = item.product?.images && item.product.images.length > 0
    ? item.product.images[0].image_path 
    : 'https://via.placeholder.com/100?text=No+Image';

  const productName = item.product?.name || 'Produk Tidak Dikenal';
  const unitPrice = item.unit_price;
  const quantity = item.quantity;
  const cartItemId = item.id;

  // FIXED: Enhanced product options parsing to handle both array and object formats
  let productOptions = {};
  try {
    console.log('Raw product_options:', item.product_options);
    
    if (item.product_options) {
      const parsed = JSON.parse(item.product_options);
      console.log('Parsed product_options:', parsed);
      
      // Handle both array and object formats
      if (Array.isArray(parsed)) {
        // Convert array format [{ name: 'Ukuran', value: 'M' }] to object format
        productOptions = parsed.reduce((acc, option) => {
          if (option.name && option.value) {
            acc[option.name] = option.value;
          }
          return acc;
        }, {});
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Use object format directly
        productOptions = parsed;
      }
    }
    
    console.log('Final productOptions:', productOptions);
  } catch (error) {
    console.error('Error parsing product options:', error);
    console.log('Failed to parse:', item.product_options);
    productOptions = {};
  }

  // FIXED: More robust size extraction with debugging
  const selectedSize = productOptions.Ukuran || 
                      productOptions.ukuran || 
                      productOptions.size || 
                      productOptions.Size || 
                      null;
                      
  const selectedColor = productOptions.Warna || 
                       productOptions.warna || 
                       productOptions.color || 
                       productOptions.Color || 
                       null;

  console.log('Extracted selectedSize:', selectedSize);
  console.log('Extracted selectedColor:', selectedColor);

  // Get available colors from product (if any)
  const availableColors = item.product?.colors || '';

  // FIXED: Get stock info for selected size with better error handling
  const selectedSizeStock = React.useMemo(() => {
    if (!selectedSize || !item.product?.size_variants) {
      console.log('No selectedSize or size_variants:', { selectedSize, size_variants: item.product?.size_variants });
      return null;
    }
    
    const sizeVariant = item.product.size_variants.find(variant => variant.size === selectedSize);
    console.log('Found size variant for', selectedSize, ':', sizeVariant);
    
    return sizeVariant ? parseInt(sizeVariant.stock_quantity) : 0;
  }, [selectedSize, item.product?.size_variants]);

  const handleDecrease = () => {
    updateQuantityInCart(cartItemId, quantity - 1);
  };

  const handleIncrease = () => {
    // Check stock limit for selected size
    const maxQuantity = selectedSizeStock || item.product?.stock_quantity || 999;
    if (quantity < maxQuantity) {
      updateQuantityInCart(cartItemId, quantity + 1);
    }
  };

  const isDisabled = isUpdating === cartItemId;
  const maxQuantity = selectedSizeStock || item.product?.stock_quantity || 999;

  return (
    <div className="flex items-start space-x-4 py-4 border-b last:border-b-0">
      {/* Product Image */}
      <img
        src={imageUrl}
        alt={productName}
        className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-gray-200"
      />
      
      <div className="flex-1 min-w-0">
        {/* Product Name */}
        <h4 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
          {productName}
        </h4>
        
        {/* FIXED: Enhanced Product Options Display with debugging */}
        <div className="space-y-2 mb-3">
          {/* Debug Info - Remove in production */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
              Debug: selectedSize = "{selectedSize}" | 
              raw options = {JSON.stringify(productOptions)}
            </div>
          )} */}
          
          {/* Size Display */}
          {selectedSize && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                Ukuran: {selectedSize}
              </span>
              {selectedSizeStock !== null && selectedSizeStock <= 5 && selectedSizeStock > 0 && (
                <span className="text-xs text-yellow-600 font-medium">
                  ({selectedSizeStock} tersisa)
                </span>
              )}
              {selectedSizeStock === 0 && (
                <span className="text-xs text-red-600 font-medium">
                  (Habis)
                </span>
              )}
            </div>
          )}
          
          {/* Fallback: Show if no size but product has size variants */}
          {!selectedSize && item.product?.size_variants?.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                Ukuran: Tidak terpilih
              </span>
            </div>
          )}
          
          {/* Color Display */}
          {(selectedColor || availableColors) && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                Warna: {selectedColor || availableColors}
              </span>
            </div>
          )}

          {/* Additional Options Display */}
          {Object.entries(productOptions).map(([key, value]) => {
            // Skip already displayed options
            if (['Ukuran', 'ukuran', 'size', 'Size', 'Warna', 'warna', 'color', 'Color'].includes(key)) {
              return null;
            }
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {key}: {value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">Jumlah:</span>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              type="button"
              onClick={handleDecrease}
              className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDisabled}
            >
              -
            </button>
            <span className="px-4 py-2 font-medium text-gray-900 border-x border-gray-300 min-w-[50px] text-center bg-gray-50">
              {isDisabled ? (
                <div className="animate-pulse text-gray-400">•••</div>
              ) : (
                quantity
              )}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDisabled || quantity >= maxQuantity}
            >
              +
            </button>
          </div>
          
          {/* Stock Warning */}
          {selectedSizeStock !== null && selectedSizeStock <= 5 && selectedSizeStock > 0 && (
            <span className="text-xs text-yellow-600 font-medium">
              Stok terbatas ({selectedSizeStock} tersisa)
            </span>
          )}
          {selectedSizeStock === 0 && (
            <span className="text-xs text-red-600 font-medium">
              Stok habis
            </span>
          )}
        </div>
      </div>

      {/* Price Section */}
      <div className="text-right flex-shrink-0">
        <p className="text-lg font-bold text-gray-900">
          {formatPrice(unitPrice * quantity)}
        </p>
        <p className="text-sm text-gray-500">
          {formatPrice(unitPrice)} / unit
        </p>
      </div>
    </div>
  );
}

export default CartItem;