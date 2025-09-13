import { Link } from 'react-router-dom';
import { useWishlist } from '../../hooks/useWishlist';
import { formatPrice } from '../../components/shop/utils/Formatters';
import RatingStars from '../../components/shop/RatingStars';

function WishList() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat wishlist Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Wishlist Saya</h1>
          <p className="text-gray-600 mt-2">{wishlistItems.length} item dalam wishlist Anda</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Wishlist Kosong</h3>
            <p className="text-gray-600 mb-6">Mulai jelajahi koleksi kami dan simpan produk favorit Anda!</p>
            <Link to="/shop" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium">
              Mulai Berbelanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                <div className="relative">
                  <img src={item.image_url || 'https://via.placeholder.com/400x400.png/f3f4f6/9ca3af?text=Image'} alt={item.name} className="w-full h-64 object-cover" />
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 shadow-md"
                    title="Hapus dari Wishlist"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <RatingStars rating={item.rating_average || 0} />
                  </div>
                  <span className="text-xl font-bold text-red-600">{formatPrice(item.price)}</span>
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700">
                      Tambah ke Keranjang
                    </button>
                     <Link to={`/shop/${item.slug}`} className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default WishList;