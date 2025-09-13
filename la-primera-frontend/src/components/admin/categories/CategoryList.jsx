import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { adminAPI } from '../../../utils/api';
import { Link } from 'react-router-dom';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterActive, setFilterActive] = useState('all');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null); // Category object for edit/delete
    const [editFormData, setEditFormData] = useState({
        name: '', slug: '', description: '', image: null, icon: '', parent_id: '',
        sort_order: 0, is_active: true, meta_title: '', meta_description: '',
        current_image_url: null, // Untuk menampilkan gambar yang sudah ada
        clear_image: false, // Flag untuk menghapus gambar yang ada
    });
    const [editErrors, setEditErrors] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [parentCategories, setParentCategories] = useState([]); // Untuk dropdown parent category

    const activeOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
    ];

    // Fungsi untuk mengambil daftar kategori utama (untuk dropdown parent)
    const fetchParentCategories = useCallback(async () => {
        try {
            // Minta backend untuk tidak melakukan paginasi saat mengambil kategori parent
            const response = await adminAPI.getCategories({ is_active: true, no_pagination: true });
            
            // Periksa struktur respons dari backend
            // Jika backend mengembalikan { data: [...] } (paginated format tanpa paginasi), gunakan response.data.data
            // Jika backend mengembalikan langsung array [...], gunakan response.data
            // Tambahkan juga fallback ke array kosong
            const categoriesData = response.data && Array.isArray(response.data.data) 
                                 ? response.data.data 
                                 : (Array.isArray(response.data) ? response.data : []);
            
            setParentCategories(categoriesData);

        } catch (err) {
            console.error("Error fetching parent categories:", err);
            // Anda bisa setParentCategories([]) di sini jika ingin dropdown kosong saat error
        }
    }, []);

    // Fungsi untuk mengambil daftar kategori utama (untuk tabel)
    const fetchCategories = useCallback(async (page = 1, search = '', active = 'all') => {
        setLoading(true);
        setError(null);
        try {
            const params = { page, search };
            if (active !== 'all') params.is_active = active;

            const response = await adminAPI.getCategories(params);
            
            // Periksa struktur respons untuk data utama paginated
            const mainCategoriesData = response.data && Array.isArray(response.data.data) 
                                     ? response.data.data 
                                     : (Array.isArray(response.data) ? response.data : []);

            setCategories(mainCategoriesData);
            setCurrentPage(response.data.meta?.current_page || 1); // Akses meta dengan hati-hati
            setLastPage(response.data.meta?.last_page || 1); // Akses meta dengan hati-hati

        } catch (err) {
            console.error("Error fetching categories:", err);
            setError(err.response?.data?.message || err.message || "Failed to fetch categories.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories(currentPage, searchQuery, filterActive);
        fetchParentCategories(); // Panggil juga untuk mengisi dropdown parent
    }, [fetchCategories, fetchParentCategories, currentPage, searchQuery, filterActive]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchCategories(1, searchQuery, filterActive);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Edit Category handlers
    const handleEditClick = (category) => {
        setSelectedCategory(category);
        setEditFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            image: null, // File input for new image
            icon: category.icon || '',
            parent_id: category.parent_id || '', // String for select input
            sort_order: category.sort_order,
            is_active: category.is_active,
            meta_title: category.meta_title || '',
            meta_description: category.meta_description || '',
            current_image_url: category.image || null, // URL gambar yang sudah ada
            clear_image: false,
        });
        setEditErrors({});
        setIsEditModalOpen(true);
    };

    const handleEditFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setEditFormData(prev => ({ ...prev, [name]: files[0], clear_image: false }));
        } else if (name === 'clear_image') {
            setEditFormData(prev => ({ ...prev, [name]: checked, image: null }));
        } else {
            setEditFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
        if (editErrors[name]) {
            setEditErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        if (!selectedCategory) return;

        setEditLoading(true);
        setEditErrors({});

        try {
            const dataToSubmit = {
                ...editFormData,
                // Pastikan parent_id adalah null jika string kosong
                parent_id: editFormData.parent_id === '' ? null : editFormData.parent_id,
            };

            const response = await adminAPI.updateCategory(selectedCategory.id, dataToSubmit);
            if (response.success) {
                alert('Category updated successfully!');
                setIsEditModalOpen(false);
                setSelectedCategory(null);
                fetchCategories(currentPage, searchQuery, filterActive); // Refresh list
                fetchParentCategories(); // Refresh parent categories too, in case changes affect them
            } else {
                alert(response.message || 'Failed to update category.');
            }
        } catch (err) {
            console.error("Error updating category:", err);
            if (err.response && err.response.data && err.response.data.errors) {
                setEditErrors(err.response.data.errors);
            } else {
                setEditErrors({ general: err.message || "An unexpected error occurred." });
            }
        } finally {
            setEditLoading(false);
        }
    };

    // Delete Category handlers
    const handleDeleteClick = (category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCategory) return;

        setLoading(true); // Main loading indicator for delete action
        try {
            const response = await adminAPI.deleteCategory(selectedCategory.id);
            if (response.success) {
                alert(response.message);
                fetchCategories(currentPage, searchQuery, filterActive); // Refresh list
                fetchParentCategories(); // Refresh parent categories too
            } else {
                alert(response.message || "Failed to delete category.");
            }
        } catch (err) {
            console.error("Error deleting category:", err);
            alert(err.response?.data?.message || err.message || "Failed to delete category.");
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
        }
    };

    const renderError = (fieldName) => {
        if (editErrors[fieldName]) {
            const errorMessage = Array.isArray(editErrors[fieldName]) ? editErrors[fieldName][0] : editErrors[fieldName];
            return <p className="mt-1 text-sm text-red-600">{errorMessage}</p>;
        }
        return null;
    };

    // Menampilkan loading atau error global saat pertama kali memuat atau ada error fetching utama
    if (loading && categories.length === 0) return <p className="text-center p-6 text-gray-700">Loading categories...</p>;
    if (error) return <p className="text-red-500 text-center p-6">Error: {error}</p>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
                <Link to="/admin/categories/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add New Category</Link>
            </div>

            <div className="flex justify-between items-center mb-6 space-x-2">
                <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
                    <input
                        type="text"
                        placeholder="Search by name or slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Search</button>
                </form>
                <select 
                    value={filterActive} 
                    onChange={(e) => { setFilterActive(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {activeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>

            {categories.length === 0 ? (
                <p className="text-center text-gray-500">No categories found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Image</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Slug</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Parent</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-700">{category.id}</td>
                                    <td className="py-3 px-4">
                                        {category.image ? (
                                            <img src={category.image} alt={category.name} className="w-16 h-16 object-cover rounded" />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded text-gray-500 text-xs">No Image</div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{category.name}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{category.slug}</td>
                                    {/* Akses nama parent category dengan hati-hati */}
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        {category.parent_category?.name ? category.parent_category.name : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {category.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        <button 
                                            onClick={() => handleEditClick(category)} 
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(category)} 
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

            {/* Edit Category Modal */}
            <Transition appear show={isEditModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsEditModalOpen(false)}>
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
                                    <DialogTitle as="h3" className="text-lg font-medium text-gray-900 mb-4">
                                        Edit Category: {selectedCategory?.name}
                                    </DialogTitle>
                                    
                                    {editErrors.general && <div className="mb-4 text-red-600">{editErrors.general}</div>}

                                    <form onSubmit={handleUpdateCategory} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                                            {renderError('name')}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Slug</label>
                                            <input type="text" name="slug" value={editFormData.slug} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                                            {renderError('slug')}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea name="description" value={editFormData.description} onChange={handleEditFormChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                                            {renderError('description')}
                                        </div>
                                        
                                        {/* Image Input and Preview */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Category Image</label>
                                            {editFormData.current_image_url && !editFormData.clear_image ? (
                                                <div className="mt-2 flex items-center space-x-2">
                                                    <img src={editFormData.current_image_url} alt="Current Category" className="w-24 h-24 object-cover rounded-md border" />
                                                    <label className="inline-flex items-center">
                                                        <input type="checkbox" name="clear_image" checked={editFormData.clear_image} onChange={handleEditFormChange} className="form-checkbox text-red-600 h-4 w-4" />
                                                        <span className="ml-2 text-sm text-gray-700">Remove Current Image</span>
                                                    </label>
                                                </div>
                                            ) : (
                                                <input type="file" name="image" onChange={handleEditFormChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*" />
                                            )}
                                            {renderError('image')}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Icon (e.g., FontAwesome class)</label>
                                            <input type="text" name="icon" value={editFormData.icon} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., fas fa-tshirt" />
                                            {renderError('icon')}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Parent Category</label>
                                            <select name="parent_id" value={editFormData.parent_id} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                                <option value="">-- No Parent (Root Category) --</option>
                                                {/* INI BARIS 368 */}
                                                {parentCategories
                                                    .filter(cat => cat.id !== selectedCategory?.id) // Jangan tampilkan kategori itu sendiri sebagai parent
                                                    .map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                            </select>
                                            {renderError('parent_id')}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                                            <input type="number" name="sort_order" value={editFormData.sort_order} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                            {renderError('sort_order')}
                                        </div>

                                        <div className="flex items-center">
                                            <input type="checkbox" name="is_active" checked={editFormData.is_active} onChange={handleEditFormChange} className="form-checkbox text-blue-600 h-5 w-5" />
                                            <label className="ml-2 text-sm text-gray-700">Active</label>
                                        </div>

                                        {/* SEO Meta */}
                                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">SEO Meta</h2>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                                            <input type="text" name="meta_title" value={editFormData.meta_title} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                            {renderError('meta_title')}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                                            <textarea name="meta_description" value={editFormData.meta_description} onChange={handleEditFormChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                                            {renderError('meta_description')}
                                        </div>

                                        <div className="mt-6 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                                onClick={() => setIsEditModalOpen(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={editLoading}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                                            >
                                                {editLoading ? 'Updating...' : 'Update Category'}
                                            </button>
                                        </div>
                                    </form>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Delete Category Confirmation Modal */}
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
                                            Are you sure you want to delete category "{selectedCategory?.name}"? This action cannot be undone.
                                        </p>
                                        {selectedCategory && selectedCategory.children?.length > 0 && (
                                            <p className="mt-2 text-sm text-yellow-600 font-semibold">
                                                Warning: This category has {selectedCategory.children.length} child categories, which will become root categories.
                                            </p>
                                        )}
                                        {selectedCategory && selectedCategory.products_count > 0 && ( // Assuming products_count is available (from withCount)
                                            <p className="mt-2 text-sm text-yellow-600 font-semibold">
                                                Warning: This category is linked to {selectedCategory.products_count} products. They will be unlinked.
                                            </p>
                                        )}
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

export default CategoryList;