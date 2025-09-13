// src/pages/admin/orders/OrderList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../../utils/api'; // Pastikan path benar
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../../components/shop/utils/Formatters';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';

function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // Filter by order status
    const navigate = useNavigate();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const statusOptions = [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'refunded', label: 'Refunded' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-purple-100 text-purple-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const fetchOrders = useCallback(async (page = 1, search = '', status = 'all') => {
        setLoading(true);
        setError(null);
        try {
            const params = { page, search, status };
            const response = await adminAPI.getOrders(params);
            setOrders(response.data);
            setCurrentPage(response.meta.current_page);
            setLastPage(response.meta.last_page);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.message || "Failed to fetch orders.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(currentPage, searchQuery, filterStatus);
    }, [fetchOrders, currentPage, searchQuery, filterStatus]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new search
        fetchOrders(1, searchQuery, filterStatus);
    };

    const handleFilterStatusChange = (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1); // Reset to first page on status change
        // fetchOrders will be triggered by useEffect
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDeleteClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedOrderId) {
            setLoading(true);
            try {
                const response = await adminAPI.deleteOrder(selectedOrderId);
                if (response.success) {
                    alert(response.message);
                    fetchOrders(currentPage, searchQuery, filterStatus); // Refresh list
                } else {
                    alert(response.message || "Failed to delete order.");
                }
            } catch (err) {
                console.error("Error deleting order:", err);
                alert(err.response?.data?.message || err.message || "Failed to delete order.");
            } finally {
                setLoading(false);
                setIsDeleteModalOpen(false);
                setSelectedOrderId(null);
            }
        }
    };

    if (loading) return <p className="text-center">Loading orders...</p>;
    if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            </div>

            <div className="flex justify-between items-center mb-6 space-x-2">
                <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
                    <input
                        type="text"
                        placeholder="Search by order#, user name, email, product..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Search</button>
                </form>
                <select 
                    value={filterStatus} 
                    onChange={handleFilterStatusChange}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>

            {orders.length === 0 ? (
                <p className="text-center text-gray-500">No orders found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Order #</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Total</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Items</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Order Date</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-700">{order.order_number}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{order.user?.name || 'N/A'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{formatPrice(order.total_amount)}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{(order.order_items?.length ?? 0)}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        <button 
                                            onClick={() => navigate(`/admin/orders/${order.id}`)} 
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            View
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(order.id)} 
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
                                            Are you sure you want to delete this order? This action cannot be undone.
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

export default OrderList;