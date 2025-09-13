// src/pages/admin/users/UserList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../../utils/api';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterActive, setFilterActive] = useState('all');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // User object for edit/delete
    const [editFormData, setEditFormData] = useState({
        name: '', email: '', phone: '', role: '', is_active: false, password: ''
    });
    const [editErrors, setEditErrors] = useState({});
    const [editLoading, setEditLoading] = useState(false);


    const roleOptions = [
        { value: 'all', label: 'All Roles' },
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' },
    ];
    const activeOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
    ];

    const fetchUsers = useCallback(async (page = 1, search = '', role = 'all', active = 'all') => {
        setLoading(true);
        setError(null);
        try {
            const params = { page, search };
            if (role !== 'all') params.role = role;
            if (active !== 'all') params.is_active = active;

            const response = await adminAPI.getUsers(params);
            setUsers(response.data);
            setCurrentPage(response.meta.current_page);
            setLastPage(response.meta.last_page);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.message || "Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(currentPage, searchQuery, filterRole, filterActive);
    }, [fetchUsers, currentPage, searchQuery, filterRole, filterActive]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchUsers(1, searchQuery, filterRole, filterActive);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Edit User handlers
    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            is_active: user.is_active,
            password: '', // Password is not loaded for security
        });
        setEditErrors({});
        setIsEditModalOpen(true);
    };

    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (editErrors[name]) {
            setEditErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        setEditLoading(true);
        setEditErrors({});

        try {
            const dataToSubmit = {
                ...editFormData,
                // Only send password if it's not empty
                password: editFormData.password || undefined,
            };

            const response = await adminAPI.updateUser(selectedUser.id, dataToSubmit);
            if (response.success) {
                alert('User updated successfully!');
                setIsEditModalOpen(false);
                setSelectedUser(null);
                fetchUsers(currentPage, searchQuery, filterRole, filterActive); // Refresh list
            } else {
                alert(response.message || 'Failed to update user.');
            }
        } catch (err) {
            console.error("Error updating user:", err);
            if (err.response && err.response.data && err.response.data.errors) {
                setEditErrors(err.response.data.errors);
            } else {
                setEditErrors({ general: err.message || "An unexpected error occurred." });
            }
        } finally {
            setEditLoading(false);
        }
    };

    // Delete User handlers
    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;

        setLoading(true);
        try {
            const response = await adminAPI.deleteUser(selectedUser.id);
            if (response.success) {
                alert(response.message);
                fetchUsers(currentPage, searchQuery, filterRole, filterActive); // Refresh list
            } else {
                alert(response.message || "Failed to delete user.");
            }
        } catch (err) {
            console.error("Error deleting user:", err);
            alert(err.response?.data?.message || err.message || "Failed to delete user.");
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
        }
    };

    const renderError = (fieldName) => {
        if (editErrors[fieldName]) {
            const errorMessage = Array.isArray(editErrors[fieldName]) ? editErrors[fieldName][0] : editErrors[fieldName];
            return <p className="mt-1 text-sm text-red-600">{errorMessage}</p>;
        }
        return null;
    };


    if (loading && users.length === 0) return <p className="text-center">Loading users...</p>;
    if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
                {/* Anda bisa menambahkan tombol 'Add New User' di sini jika mau */}
                {/* <Link to="/admin/users/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add New User</Link> */}
            </div>

            <div className="flex justify-between items-center mb-6 space-x-2">
                <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
                    <input
                        type="text"
                        placeholder="Search by name, email, phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Search</button>
                </form>
                <select 
                    value={filterRole} 
                    onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
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

            {users.length === 0 ? (
                <p className="text-center text-gray-500">No users found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Role</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-700">{user.id}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{user.name}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{user.email}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        <button 
                                            onClick={() => handleEditClick(user)} 
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(user)} 
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

            {/* Edit User Modal */}
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
                                        Edit User: {selectedUser?.name}
                                    </DialogTitle>
                                    
                                    {editErrors.general && <div className="mb-4 text-red-600">{editErrors.general}</div>}

                                    <form onSubmit={handleUpdateUser} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                                            {renderError('name')}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input type="email" name="email" value={editFormData.email} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                                            {renderError('email')}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <input type="text" name="phone" value={editFormData.phone} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                            {renderError('phone')}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Role</label>
                                            <select name="role" value={editFormData.role} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            {renderError('role')}
                                        </div>
                                        <div className="flex items-center">
                                            <input type="checkbox" name="is_active" checked={editFormData.is_active} onChange={handleEditFormChange} className="form-checkbox text-blue-600 h-5 w-5" />
                                            <label className="ml-2 text-sm text-gray-700">Is Active</label>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">New Password (optional)</label>
                                            <input type="password" name="password" value={editFormData.password} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Leave blank to keep current password" />
                                            {renderError('password')}
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
                                                {editLoading ? 'Updating...' : 'Update User'}
                                            </button>
                                        </div>
                                    </form>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Delete User Confirmation Modal */}
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
                                            Are you sure you want to delete user "{selectedUser?.name}" ({selectedUser?.email})? This action cannot be undone.
                                        </p>
                                        {selectedUser?.role === 'admin' && (
                                            <p className="mt-2 text-sm text-red-600 font-semibold">
                                                Warning: You are about to delete an ADMIN user.
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

export default UserList;