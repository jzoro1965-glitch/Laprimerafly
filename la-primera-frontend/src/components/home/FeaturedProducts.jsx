import { useState } from 'react';
// import f2 from '../../src/assets/img/products/f2.jpg';
import f2 from '../../assets/img/products/f2.jpg';
import f1 from '../../assets/img/products/f1.jpg';
import f3 from '../../assets/img/products/f3.png';
import f3back from '../../assets/img/products/f3-back.png';
import f3model from '../../assets/img/products/f3-model.PNG';
import f4model from '../../assets/img/products/f4model.PNG';
import f4 from '../../assets/img/products/f4.png';
// import f5 from '../../src/assets/img/products/f5.png';
import f5 from '../../assets/img/products/f5.png';

function Shop() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const categories = [
    { id: 'all', name: 'Semua Produk' },
    { id: 'men', name: 'Pria' },
    { id: 'women', name: 'Wanita' },
    { id: 'accessories', name: 'Aksesoris' },
    { id: 'bags', name: 'Tas' }
  ];

  const products = [
    {
      id: 1,
      name: 'LA PRIMERA Premium Hoodie',
      category: 'men',
      price: 399000,
      originalPrice: 499000,
      discount: 20,
      image: f2,
      images: [
        f2,
        f2,
        f2
      ],
      rating: 4.9,
      reviews: 156,
      isNew: true,
      isBestSeller: true,
      description: 'Hoodie premium dengan desain eksklusif LA PRIMERA. Dibuat dari bahan berkualitas tinggi dengan detail geometris yang stylish. Cocok untuk gaya kasual modern dan memberikan kenyamanan maksimal.',
      features: ['Premium Cotton Blend', 'Geometric Design Details', 'Adjustable Hood', 'Kangaroo Pocket', 'Ribbed Cuffs'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Hitam', 'Navy', 'Abu-abu Gelap'],
      stock: 28,
      sku: 'LPH-001',
      weight: '450g',
      dimensions: '35 x 45 cm'
    },
    {
      id: 2,
      name: 'SPACE FUN Ring Planet T-Shirt',
      category: 'men',
      price: 249000,
      originalPrice: 329000,
      discount: 24,
      image: f1,
      images: [
        f1,
        f1
      ],
      rating: 4.7,
      reviews: 142,
      isNew: true,
      isBestSeller: false,
      description: 'T-shirt dengan desain ilustrasi luar angkasa yang fun dan kreatif. Menampilkan grafis "RING PLANET" dengan detail planet Saturnus, roket, UFO, dan elemen space lainnya. Sempurna untuk pecinta astronomi dan desain unik. Dibuat dari bahan katun premium yang nyaman dan breathable.',
      features: ['Ilustrasi Space Theme Eksklusif', '100% Premium Cotton', 'Print Tahan Lama', 'Comfortable Fit', 'Double-sided Design'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Steel Blue', 'Hitam', 'Navy', 'Abu-abu'],
      stock: 35,
      sku: 'SPF-002',
      weight: '200g',
      dimensions: '30 x 40 cm'
    },
    {
  id: 3,
  name: 'NEVER Minimalist Floral Hoodie',
  category: 'hoodies',
  price: 349000,
  originalPrice: 449000,
  discount: 22,
  image: f3,
  images: [
    f3back,
    f3model
  ],
  rating: 4.6,
  reviews: 89,
  isNew: true,
  isBestSeller: false,
  description: 'Hoodie premium dengan desain minimalis yang elegan, menampilkan motif ranting bunga artistik dan tulisan "NEVER" dengan font modern. Dibuat dari cotton fleece berkualitas tinggi yang memberikan kenyamanan maksimal dan kehangatan optimal.',
  features: ['Premium Cotton Fleece 320 GSM', 'Minimalist Floral Design', 'Adjustable Hood', 'Kangaroo Pocket', 'Ribbed Cuffs & Hem'],
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Light Grey', 'Putih', 'Hitam', 'Navy'],
  stock: 28,
  sku: 'NVR-004',
  weight: '650g',
  dimensions: '35 x 45 cm'
},
    {
  id: 4,
  name: 'NEVER Black Edition Floral Hoodie',
  category: 'hoodies',
  price: 379000,
  originalPrice: 459000,
  discount: 17,
  image: f5,
  images: [
    f5,
    f5
  ],
  rating: 4.7,
  reviews: 203,
  isNew: true,
  isBestSeller: true,
  description: 'Hoodie edisi hitam dengan desain floral minimalis yang sophisticated. Menampilkan motif ranting bunga dengan aksen emas yang elegan pada base warna hitam premium. Perpaduan sempurna antara streetwear dan luxury aesthetic yang cocok untuk berbagai occasion.',
  features: ['Premium Heavy Weight Cotton 350 GSM', 'Gold Foil Floral Print', 'Oversized Relaxed Fit', 'Double-lined Hood', 'Kangaroo Pocket with Hidden Zipper', 'Ribbed Hem & Cuffs'],
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Hitam', 'Charcoal', 'Navy', 'Forest Green'],
  stock: 35,
  sku: 'NVR-006',
  weight: '720g',
  dimensions: '38 x 48 cm'
},
    {
  id: 5,
  name: 'LPRM Premium Zip Hoodie',
  category: 'hoodies',
  price: 399000,
  originalPrice: 499000,
  discount: 20,
  image: f4,
  images: [
    f4model,
    f4
  ],
  rating: 4.8,
  reviews: 156,
  isNew: false,
  isBestSeller: true,
  description: 'Zip hoodie premium dengan desain logo "LPRM" yang bold dan elegan. Menampilkan warna hitam klasik dengan aksen logo coklat tembaga yang memberikan kesan luxury dan modern. Dilengkapi full zip untuk kemudahan pemakaian dan fleksibilitas styling.',
  features: ['Premium Cotton Blend 340 GSM', 'Full Zip Closure', 'Bold LPRM Logo Print', 'Kangaroo Pocket', 'Ribbed Cuffs & Waistband', 'Adjustable Drawstring Hood'],
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Hitam', 'Navy', 'Abu-abu', 'Olive'],
  stock: 42,
  sku: 'LPRM-005',
  weight: '700g',
  dimensions: '36 x 46 cm'
},
    {
      id: 6,
      name: 'Stylish Sunglasses',
      category: 'accessories',
      price: 349000,
      originalPrice: 449000,
      discount: 22,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      images: [
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.4,
      reviews: 78,
      isNew: true,
      isBestSeller: false,
      description: 'Kacamata hitam stylish dengan perlindungan UV yang optimal. Desain modern dengan kenyamanan maksimal.',
      features: ['UV400 protection', 'Polarized lenses', 'Lightweight frame', 'Anti-glare'],
      sizes: ['One Size'],
      colors: ['Black', 'Brown', 'Gold'],
      stock: 35,
      sku: 'SSG-006',
      weight: '50g',
      dimensions: '15 x 5 x 3 cm'
    },
    {
      id: 7,
      name: 'Floral Print Blouse',
      category: 'women',
      price: 389000,
      originalPrice: 489000,
      discount: 20,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      images: [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.7,
      reviews: 103,
      isNew: false,
      isBestSeller: true,
      description: 'Blouse dengan motif floral yang elegan dan feminin. Cocok untuk acara formal maupun kasual.',
      features: ['Soft fabric', 'Floral print', 'Comfortable fit', 'Easy to care'],
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Pink', 'Blue', 'White'],
      stock: 22,
      sku: 'FPB-007',
      weight: '250g',
      dimensions: '35 x 45 cm'
    },
    {
      id: 8,
      name: 'Designer Backpack',
      category: 'bags',
      price: 749000,
      originalPrice: 999000,
      discount: 25,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.8,
      reviews: 145,
      isNew: true,
      isBestSeller: false,
      description: 'Backpack designer dengan desain modern dan fungsional. Cocok untuk aktivitas sehari-hari dan perjalanan.',
      features: ['Water resistant', 'Laptop compartment', 'Ergonomic design', 'Multiple pockets'],
      sizes: ['One Size'],
      colors: ['Black', 'Navy', 'Grey'],
      stock: 15,
      sku: 'DB-008',
      weight: '700g',
      dimensions: '30 x 45 x 15 cm'
    }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor"/>
              <stop offset="50%" stopColor="transparent"/>
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }

    return stars;
  };

  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
    setActiveImageIndex(0);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => Math.min(prev + 1, selectedProduct?.stock || 1));
    } else {
      setQuantity(prev => Math.max(prev - 1, 1));
    }
  };

  return (
    <>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Produk <span className="text-red-600">Unggulan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Koleksi terpilih dengan kualitas premium dan desain terdepan yang paling disukai pelanggan
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  activeCategory === category.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isNew && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        BARU
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        TERLARIS
                      </span>
                    )}
                  </div>

                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                        -{product.discount}%
                      </span>
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button 
                      onClick={() => openProductDetail(product)}
                      className="bg-white text-gray-900 p-3 rounded-full hover:bg-red-600 hover:text-white transition-colors duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="bg-white text-gray-900 p-3 rounded-full hover:bg-red-600 hover:text-white transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors duration-300 transform hover:scale-105 shadow-lg shadow-red-600/25">
                    Tambah ke Keranjang
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <button className="bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors duration-300 transform hover:scale-105 shadow-lg">
              Lihat Semua Produk
            </button>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detail Produk</h2>
                <button
                  onClick={closeProductDetail}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Images */}
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={selectedProduct.images[activeImageIndex]}
                      alt={selectedProduct.name}
                      className="w-full h-96 object-cover"
                    />
                    {selectedProduct.discount > 0 && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                          -{selectedProduct.discount}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Thumbnails */}
                  {selectedProduct.images.length > 1 && (
                    <div className="flex gap-2">
                      {selectedProduct.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            activeImageIndex === index ? 'border-red-600' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${selectedProduct.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  {/* Product Title and Badges */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {selectedProduct.isNew && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          BARU
                        </span>
                      )}
                      {selectedProduct.isBestSeller && (
                        <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          TERLARIS
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h1>
                    <p className="text-gray-600">SKU: {selectedProduct.sku}</p>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {renderStars(selectedProduct.rating)}
                    </div>
                    <span className="text-lg font-medium text-gray-900">{selectedProduct.rating}</span>
                    <span className="text-gray-600">({selectedProduct.reviews} ulasan)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-red-600">
                      {formatPrice(selectedProduct.price)}
                    </span>
                    {selectedProduct.originalPrice > selectedProduct.price && (
                      <span className="text-2xl text-gray-500 line-through">
                        {formatPrice(selectedProduct.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Deskripsi</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Fitur Unggulan</h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {selectedProduct.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Size Selection */}
                  {selectedProduct.sizes.length > 1 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Ukuran</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                              selectedSize === size
                                ? 'border-red-600 bg-red-600 text-white'
                                : 'border-gray-300 hover:border-red-600 hover:text-red-600'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Warna</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                            selectedColor === color
                              ? 'border-red-600 bg-red-600 text-white'
                              : 'border-gray-300 hover:border-red-600 hover:text-red-600'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity and Stock */}
                  <div className="flex items-center gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Jumlah</h3>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange('decrease')}
                          className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
                          disabled={quantity <= 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="px-4 py-2 font-medium text-gray-900 border-x border-gray-300">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange('increase')}
                          className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
                          disabled={quantity >= selectedProduct.stock}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Stok tersisa</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedProduct.stock} unit</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button className="flex-1 bg-red-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-red-700 transition-colors duration-300 transform hover:scale-105 shadow-lg shadow-red-600/25">
                      <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5m6 1.5a2 2 0 11-4 0 2 2 0 014 0zM17 21a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Tambah ke Keranjang
                    </button>
                    <button className="bg-gray-900 text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors duration-300">
                      Beli Sekarang
                    </button>
                    <button className="border border-gray-300 text-gray-700 py-4 px-4 rounded-xl hover:border-red-600 hover:text-red-600 transition-colors duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Product Information */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Produk</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Berat:</span>
                        <span className="font-medium text-gray-900 ml-2">{selectedProduct.weight}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Dimensi:</span>
                        <span className="font-medium text-gray-900 ml-2">{selectedProduct.dimensions}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Kategori:</span>
                        <span className="font-medium text-gray-900 ml-2 capitalize">{selectedProduct.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-medium text-gray-900 ml-2">{selectedProduct.sku}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Pengiriman</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Gratis ongkir untuk pembelian minimal Rp 500.000
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Estimasi pengiriman 2-4 hari kerja
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Garansi 30 hari tukar barang
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Shop;