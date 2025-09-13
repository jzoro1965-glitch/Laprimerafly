// src/components/admin/products/ProductCreate.jsx 
import React, { useState, useEffect } from 'react';
import { adminAPI, categoryAPI } from '../../../utils/api';
import { useNavigate } from 'react-router-dom';

function ProductCreate() {
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
        images: [],
        colors: '', // Simple string input
        size_variants: [
            { size: 'M', stock_quantity: 0 },
            { size: 'L', stock_quantity: 0 },
            { size: 'S', stock_quantity: 0 } // Changed from XL to S
        ]
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [previewImages, setPreviewImages] = useState([]);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryAPI.getCategories({ no_pagination: true, is_active: true });
                
                const fetchedCategories = response.data && Array.isArray(response.data.data) 
                                        ? response.data.data 
                                        : (Array.isArray(response.data) ? response.data : []);
                
                setCategories(fetchedCategories);

            } catch (err) {
                console.error("Error fetching categories for ProductCreate:", err);
                setErrors({ general: err.response?.data?.message || err.message || "Failed to load categories." });
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Handler for input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear specific error if input changes
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Handler for category changes
    const handleCategoryChange = (e) => {
        const options = Array.from(e.target.selectedOptions).map(option => option.value);
        setFormData(prev => ({ ...prev, category_ids: options }));
        if (errors.category_ids) {
            setErrors(prev => ({ ...prev, category_ids: null }));
        }
    };

    // Handler for size variant stock changes
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

    // Handler for image changes
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, images: files }));

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(newPreviews);
        if (errors.images) {
            setErrors(prev => ({ ...prev, images: null }));
        }
    };

    // Calculate total stock from size variants
    const getTotalStock = () => {
        return formData.size_variants.reduce((total, variant) => total + (variant.stock_quantity || 0), 0);
    };

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
                
                // Filter out size variants with 0 stock and format them
                size_variants: formData.size_variants.filter(variant => variant.stock_quantity > 0),
                
                // Keep colors as simple string - no conversion needed
                colors: formData.colors.trim(),
            };

            // Remove the old stock_quantity field since we're using size variants now
            delete dataToSubmit.stock_quantity;

            const response = await adminAPI.createProduct(dataToSubmit);
            
            if (response.success || response.data) {
                alert('Product created successfully!');
                navigate('/admin/products');
            } else {
                alert(response.message || 'Failed to create product.');
            }
        } catch (err) {
            console.error("Error creating product:", err);
            if (err.response && err.response.data && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: err.message || "An unexpected error occurred during product creation." });
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper function to render error messages
    const renderError = (fieldName) => {
        if (errors[fieldName]) {
            const errorMessage = Array.isArray(errors[fieldName]) ? errors[fieldName][0] : errors[fieldName];
            return <p className="mt-1 text-sm text-red-600">{errorMessage}</p>;
        }
        return null;
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Product</h1>
            
            {/* Display general error if any */}
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

                {/* Colors Input - Simple string input like name, slug, sku */}
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

                {/* Product Variants */}
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

                {/* Images */}
                <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Product Images</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Images</label>
                    <input 
                        type="file" 
                        name="images" 
                        multiple 
                        onChange={handleImageChange} 
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                        accept="image/*" 
                    />
                    {renderError('images')}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {previewImages.map((src, index) => (
                            <img 
                                key={index} 
                                src={src} 
                                alt={`Preview ${index}`} 
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
                        {loading ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProductCreate;