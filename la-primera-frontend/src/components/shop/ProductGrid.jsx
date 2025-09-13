import ProductCard from './ProductCard';

const ProductGrid = ({ products, onOpenDetail, wishlistIds, addToWishlist, removeFromWishlist }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onOpenDetail={onOpenDetail}
          wishlistIds={wishlistIds}
          addToWishlist={addToWishlist}
          removeFromWishlist={removeFromWishlist}
        />
      ))}
    </div>
  );
};

export default ProductGrid;