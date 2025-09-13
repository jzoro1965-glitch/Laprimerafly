import { formatPrice } from '../../components/shop/utils/Formatters';
import RatingStars from './RatingStars';

const ProductCard = ({ product, onOpenDetail, wishlistIds, addToWishlist, removeFromWishlist }) => {
  const isInWishlist = wishlistIds && wishlistIds.has(product.id);

  const handleWishlistClick = (e) => {
    e.stopPropagation(); 
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleDetailClick = () => {
    onOpenDetail(product);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
      <div className="relative overflow-hidden">
        <img
          src={product.image_url || 'https://via.placeholder.com/400x400.png/f3f4f6/9ca3af?text=Image'}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.is_featured && <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">TERLARIS</span>}
        </div>

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button 
            onClick={() => onOpenDetail(product)}
            className="bg-white text-gray-900 p-3 rounded-full hover:bg-red-600 hover:text-white transition-colors duration-300"
            aria-label="Quick View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button 
            onClick={handleWishlistClick}
            className="bg-white text-red-600 p-3 rounded-full hover:bg-red-100 transition-colors duration-300" 
            aria-label="Add to Wishlist"
          >
            <svg className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors h-14">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <RatingStars rating={product.rating_average || 0} />
          <span className="text-sm text-gray-600">{product.rating_average || 0} ({product.rating_count || 0} reviews)</span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold text-red-600">{formatPrice(product.price)}</span>
          {product.compare_price > product.price && (
            <span className="text-lg text-gray-500 line-through">{formatPrice(product.compare_price)}</span>
          )}
        </div>

        <button 
          onClick={handleDetailClick}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors duration-300 transform hover:scale-105 shadow-lg shadow-red-600/25"
        >
          Lihat Detail
        </button>
      </div>
    </div>
  );
};

export default ProductCard;