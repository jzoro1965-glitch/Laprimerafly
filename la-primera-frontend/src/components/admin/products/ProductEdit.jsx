// src/components/admin/products/ProductEdit.jsx 
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { adminAPI, categoryAPI } from '../../../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

function ProductEdit() {
    const { id } = useParams(); // Ambil ID produk dari URL
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', 
        slug: '', 
        description: '', 
        short_description: '', 
        sku: '',
        price: '', 
        brand: '', 
        category_ids: [], 
        new_images: [], // File gambar baru yang akan diunggah
        existing_images: [], // URL gambar yang sudah ada
        existing_image_ids_to_delete: [], // ID gambar yang akan dihapus
        existing_image_primary_id: null, // ID gambar yang akan dijadikan primary
        colors: '', // Simple string input like ProductCreate
        size_variants: [
            { size: 'M', stock_quantity: 0 },
            { size: 'L', stock_quantity: 0 },
            { size: 'S', stock_quantity: 0 } // Changed from XL to S
        ]
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true); // Loading untuk fetching dan submit
    const [errors, setErrors] = useState({});
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    const [isImageDeleteModalOpen, setIsImageDeleteModalOpen] = useState(false);
    const [imageToDeleteId, setImageToDeleteId] = useState(null);
    const [imageToDeletePath, setImageToDeletePath] = useState('');

    // Fetch data produk dan kategori
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const productResponse = await adminAPI.getProduct(id);
                // Mengambil kategori untuk dropdown (tanpa paginasi, hanya yang aktif)
                const categoryResponse = await categoryAPI.getCategories({ no_pagination: true, is_active: true }); 

                // productResponse.data sekarang adalah objek produk itu sendiri (dari ProductResource)
                const productData = productResponse.data; 

                // Penanganan respons kategori (bisa paginated atau langsung array)
                const fetchedCategories = categoryResponse.data && Array.isArray(categoryResponse.data.data) 
                                        ? categoryResponse.data.data 
                                        : (Array.isArray(categoryResponse.data) ? categoryResponse.data : []);

                // Convert size variants from product data to form format
                let sizeVariantsForForm = [
                    { size: 'M', stock_quantity: 0 },
                    { size: 'L', stock_quantity: 0 },
                    { size: 'S', stock_quantity: 0 } // Changed from XL to S
                ];

                if (productData.size_variants && Array.isArray(productData.size_variants)) {
                    // Update the default variants with actual data
                    productData.size_variants.forEach(variant => {
                        const index = sizeVariantsForForm.findIndex(v => v.size === variant.size);
                        if (index !== -1) {
                            sizeVariantsForForm[index].stock_quantity = variant.stock_quantity || 0;
                        }
                    });
                }

                // Set form data dari produk yang diambil
                setFormData({
                    name: productData.name || '',
                    slug: productData.slug || '',
                    description: productData.description || '',
                    short_description: productData.short_description || '',
                    sku: productData.sku || '',
                    price: productData.price || 0,
                    brand: productData.brand || '',
                    // Pastikan category_ids adalah array of strings (ID kategori)
                    category_ids: productData.categories ? productData.categories.map(cat => String(cat.id)) : [], 
                    new_images: [],
                    // productData.images mungkin undefined jika tidak ada gambar
                    existing_images: productData.images || [], 
                    existing_image_ids_to_delete: [],
                    // Cari ID gambar utama, pastikan array images ada dan tidak kosong
                    existing_image_primary_id: (productData.images && productData.images.length > 0)
                                               ? (productData.images.find(img => img.is_primary)?.id || null)
                                               : null,
                    colors: productData.colors || '', // Simple string like ProductCreate
                    size_variants: sizeVariantsForForm
                });
                setCategories(fetchedCategories);
            } catch (err) {
                console.error("Error fetching data:", err);
                // Tangani kasus 404 Not Found (produk tidak ada) atau error lain
                if (err.response && err.response.status === 404) {
                    setErrors({ general: "Product not found or access denied." });
                } else {
                    setErrors({ general: err.message || "Failed to load product data." });
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]); // id sebagai dependency agar useEffect berjalan jika ID berubah

    // Handler untuk perubahan input form
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Handler untuk perubahan pilihan kategori
    const handleCategoryChange = (e) => {
        const options = Array.from(e.target.selectedOptions).map(option => option.value);
        setFormData(prev => ({ ...prev, category_ids: options }));
        if (errors.category_ids) {
            setErrors(prev => ({ ...prev, category_ids: null }));
        }
    };

    // Handler for size variant stock changes (same as ProductCreate)
    const handleSizeVariantChange = (sizeIndex, stockValue) => {
        const updatedVariants = formData.size_variants.map((variant, index) => 
            index === sizeIndex 
                ? { ...variant, stock_quantity: parseInt(stockValue) || 0 }
                : variant
        );
        
        setFormData(prev => ({ ...prev, size_variants: updatedVariants }));
        
        // Clear size variant errors
        if (errors.size_variants) {
            setErrors(prev => ({ ...prev, size_variants: null }));
        }
    };

    // Calculate total stock from size variants (same as ProductCreate)
    const getTotalStock = () => {
        return formData.size_variants.reduce((total, variant) => total + (variant.stock_quantity || 0), 0);
    };

    // Handler untuk upload gambar baru
    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, new_images: files }));

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews(newPreviews);
        if (errors.new_images) {
            setErrors(prev => ({ ...prev, new_images: null }));
        }
    };

    // Handler untuk menghapus gambar yang sudah ada (dari existing_images)
    const handleRemoveExistingImage = (imageId, imagePath) => {
        setImageToDeleteId(imageId);
        setImageToDeletePath(imagePath);
        setIsImageDeleteModalOpen(true);
    };

    const confirmRemoveExistingImage = () => {
        setFormData(prev => ({
            ...prev,
            existing_images: prev.existing_images.filter(img => img.id !== imageToDeleteId),
            existing_image_ids_to_delete: [...prev.existing_image_ids_to_delete, imageToDeleteId],
            // Jika gambar yang dihapus adalah primary, reset primary_id
            existing_image_primary_id: prev.existing_image_primary_id === imageToDeleteId ? null : prev.existing_image_primary_id,
        }));
        setIsImageDeleteModalOpen(false);
        setImageToDeleteId(null);
        setImageToDeletePath('');
    };

    // Handler untuk mengubah gambar utama
    const handleSetPrimaryImage = (imageId) => {
        setFormData(prev => ({
            ...prev,
            existing_image_primary_id: imageId,
        }));
    };

    // Handler untuk submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Validate that at least one size variant has stock
        const totalStock = getTotalStock();
        if (totalStock <= 0) {
            setErrors({ size_variants: 'At least one size must have stock greater than 0.' });
            setLoading(false);
            return;
        }

        try {
            const dataToSubmit = {
                ...formData,
                // Convert numeric values
                price: parseFloat(formData.price),
                
                // Filter out size variants with 0 stock and format them (same as ProductCreate)
                size_variants: formData.size_variants.filter(variant => variant.stock_quantity > 0),
                
                // Keep colors as simple string - no conversion needed
                colors: formData.colors.trim(),
            };

            const response = await adminAPI.updateProduct(id, dataToSubmit);
            if (response.success) {
                alert('Product updated successfully!');
                navigate('/admin/products');
            } else {
                alert(response.message || 'Failed to update product.');
            }
        } catch (err) {
            console.error("Error updating product:", err);
            if (err.response && err.response.data && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: err.message || "An unexpected error occurred." });
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper function to render error messages (same as ProductCreate)
    const renderError = (fieldName) => {
        if (errors[fieldName]) {
            const errorMessage = Array.isArray(errors[fieldName]) ? errors[fieldName][0] : errors[fieldName];
            return <p className="mt-1 text-sm text-red-600">{errorMessage}</p>;
        }
        return null;
    };

    // Menampilkan loading atau error global saat pertama kali memuat produk
    // Kondisi `!formData.name` memastikan pesan loading/error hanya tampil jika data belum berhasil dimuat.
    if (loading && !formData.name) return <p className="text-center p-6 text-gray-700">Loading product data...</p>;
    if (errors.general && !formData.name) return <p className="text-red-500 text-center p-6">Error: {errors.general}</p>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Product: {formData.name}</h1>
            
            {errors.general && <div className="mb-4 text-red-600">{errors.general}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                            required 
                        />
                        {renderError('name')}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Slug</label>
                        <input 
                            type="text" 
                            name="slug" 
                            value={formData.slug} 
                            onChange={handleInputChange} 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                            required 
                        />
                        {renderError('slug')}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">SKU</label>
                        <input 
                            type="text" 
                            name="sku" 
                            value={formData.sku} 
                            onChange={handleInputChange} 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                            required 
                        />
                        {renderError('sku')}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Brand</label>
                        <input 
                            type="text" 
                            name="brand" 
                            value={formData.brand} 
                            onChange={handleInputChange} 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                        />
                        {renderError('brand')}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Short Description</label>
                    <textarea 
                        name="short_description" 
                        value={formData.short_description} 
                        onChange={handleInputChange} 
                        rows="3" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    ></textarea>
                    {renderError('short_description')}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Description</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleInputChange} 
                        rows="5" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    ></textarea>
                    {renderError('description')}
                </div>

                {/* Colors Input - Simple string input like ProductCreate */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Available Colors</label>
                    <input
                        type="text"
                        name="colors"
                        value={formData.colors}
                        onChange={handleInputChange}
                        placeholder="e.g., Red, Blue, Black, White"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Enter available colors as text (same as entering name or brand)
                    </p>
                    {renderError('colors')}
                </div>

                {/* Pricing */}
                <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input 
                            type="number" 
                            name="price" 
                            value={formData.price} 
                            onChange={handleInputChange} 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                            step="0.01" 
                            required 
                        />
                        {renderError('price')}
                    </div>
                </div>

                {/* Product Variants - Same as ProductCreate */}
                <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Product Variants</h2>

                {/* Size Variants with Stock */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Size Variants & Stock</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {formData.size_variants.map((variant, index) => (
                            <div key={variant.size} className="border border-gray-300 rounded-lg p-4 bg-white">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Size {variant.size}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={variant.stock_quantity}
                                    onChange={(e) => handleSizeVariantChange(index, e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="Stock quantity"
                                />
                                <p className="text-xs text-gray-500 mt-1">Stock for size {variant.size}</p>
                            </div>
                        ))}
                    </div>
                    
                    {/* Total Stock Display */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800">
                            Total Stock: <span className="text-lg font-bold">{getTotalStock()} units</span>
                        </p>
                        {getTotalStock() === 0 && (
                            <p className="text-xs text-red-600 mt-1">At least one size must have stock &gt; 0</p>
                        )}
                    </div>
                    
                    {renderError('size_variants')}
                </div>

                {/* Categories */}
                <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Categories</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Categories (Hold Ctrl/Cmd to select multiple)</label>
                    <select
                        name="category_ids"
                        multiple
                        value={formData.category_ids}
                        onChange={handleCategoryChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {renderError('category_ids')}
                </div>

                {/* Existing Images */}
                <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Existing Images</h2>
                <div className="flex flex-wrap gap-4">
                    {formData.existing_images.length === 0 ? (
                        <p className="text-gray-500">No existing images.</p>
                    ) : (
                        formData.existing_images.map((img) => (
                            <div key={img.id} className="relative w-32 h-32 border border-gray-200 rounded-md overflow-hidden group">
                                <img src={img.image_path} alt={img.alt_text} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => handleSetPrimaryImage(img.id)}
                                        className={`text-white text-sm py-1 px-2 rounded-full mb-1 ${formData.existing_image_primary_id === img.id ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {formData.existing_image_primary_id === img.id ? 'Primary' : 'Set Primary'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(img.id, img.image_path)}
                                        className="text-white text-sm py-1 px-2 bg-red-600 rounded-full hover:bg-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                                {formData.existing_image_primary_id === img.id && (
                                    <span className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Primary</span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* New Images Upload */}
                <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Upload New Images</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Choose Files</label>
                    <input 
                        type="file" 
                        name="new_images" 
                        multiple 
                        onChange={handleNewImageChange} 
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                        accept="image/*" 
                    />
                    {renderError('new_images')}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {newImagePreviews.map((src, index) => (
                            <img 
                                key={index} 
                                src={src} 
                                alt={`New Preview ${index}`} 
                                className="w-24 h-24 object-cover rounded-md border border-gray-200" 
                            />
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-8">
                    <button 
                        type="submit" 
                        disabled={loading || getTotalStock() === 0} 
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:bg-blue-400"
                    >
                        {loading ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </form>

            {/* Image Delete Confirmation Modal */}
            <Transition appear show={isImageDeleteModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsImageDeleteModalOpen(false)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
                    </TransitionChild>

                    <div className="fixed inset-0 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                                    <DialogTitle as="h3" className="text-lg font-medium text-gray-900">
                                        Confirm Image Deletion
                                    </DialogTitle>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to remove this image? It will be permanently deleted.
                                        </p>
                                        {imageToDeletePath && (
                                            <img src={imageToDeletePath} alt="Image to delete" className="mt-4 w-32 h-32 object-cover rounded mx-auto" />
                                        )}
                                    </div>

                                    <div className="mt-4 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none"
                                            onClick={() => setIsImageDeleteModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                                            onClick={confirmRemoveExistingImage}
                                        >
                                            Delete Image
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}

export default ProductEdit;