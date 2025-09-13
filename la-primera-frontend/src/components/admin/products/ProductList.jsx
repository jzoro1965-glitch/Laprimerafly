// src/pages/admin/products/ProductList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../../utils/api'; // Pastikan path benar
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../../components/shop/utils/Formatters';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const fetchProducts = useCallback(async (page = 1, search = '') => {
        setLoading(true);
        setError(null);
        try {
            const params = { page, search };
            const response = await adminAPI.getProducts(params);
            setProducts(response.data);
            setCurrentPage(response.meta.current_page);
            setLastPage(response.meta.last_page);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message || "Failed to fetch products.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(currentPage, searchQuery);
    }, [fetchProducts, currentPage, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new search
        fetchProducts(1, searchQuery);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDeleteClick = (productId) => {
        setSelectedProductId(productId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedProductId) {
            setLoading(true);
            try {
                const response = await adminAPI.deleteProduct(selectedProductId);
                if (response.success) {
                    alert(response.message);
                    fetchProducts(currentPage, searchQuery); // Refresh list
                } else {
                    alert(response.message || "Failed to delete product.");
                }
            } catch (err) {
                console.error("Error deleting product:", err);
                alert(err.response?.data?.message || err.message || "Failed to delete product.");
            } finally {
                setLoading(false);
                setIsDeleteModalOpen(false);
                setSelectedProductId(null);
            }
        }
    };

    if (loading) return <p className="text-center">Loading products...</p>;
    if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
                <Link to="/admin/products/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add New Product</Link>
            </div>

            <form onSubmit={handleSearch} className="mb-6 flex space-x-2">
                <input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Search</button>
            </form>

            {products.length === 0 ? (
                <p className="text-center text-gray-500">No products found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Image</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">SKU</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Price</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Stock</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-700">{product.id}</td>
                                    <td className="py-3 px-4">
                                        <img 
                                            src={product.images?.[0]?.image_path || '/images/placeholder.webp'} 
                                            alt={product.name} 
                                            className="w-16 h-16 object-cover rounded" 
                                        />
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{product.name}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{product.sku}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{formatPrice(product.price)}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{product.stock_quantity}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        <button 
                                            onClick={() => navigate(`/admin/products/edit/${product.id}`)} 
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(product.id)} 
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    {[...Array(lastPage).keys()].map((page) => (
                        <button
                            key={page + 1}
                            onClick={() => handlePageChange(page + 1)}
                            className={`px-4 py-2 rounded-lg font-semibold ${
                                currentPage === page + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            {page + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Transition appear show={isDeleteModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsDeleteModalOpen(false)}>
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
                                        Confirm Deletion
                                    </DialogTitle>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this product? This action cannot be undone.
                                        </p>
                                    </div>

                                    <div className="mt-4 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none"
                                            onClick={() => setIsDeleteModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                                            onClick={handleConfirmDelete}
                                        >
                                            Delete
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

export default ProductList;