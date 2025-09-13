import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
// Menggunakan ikon Heroicons untuk sentuhan visual yang lebih menarik
import { CubeIcon, ShoppingCartIcon, UsersIcon, TagIcon } from '@heroicons/react/24/solid'; 

function AdminDashboard() {
    const [stats, setStats] = useState({
        total_orders: 0,
        total_sales: 0,
        total_users: 0,
        // total_products: 0, // Pastikan Anda juga fetch ini jika ingin menampilkannya
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await adminAPI.getDashboardStats();
                if (response.success) {
                    setStats(response.data);
                } else {
                    setError(response.message || "Failed to load dashboard stats.");
                }
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
                setError(err.response?.data?.message || err.message || "Failed to fetch dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-gray-50 p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-700">Loading dashboard statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-red-50 p-6 rounded-lg shadow-md">
                <p className="text-red-700 font-semibold text-lg">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-[calc(100vh-80px)]"> {/* Menambah min-height untuk layout */}
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center sm:text-left">Admin Overview</h1>
                
                {/* Statistik Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    
                    {/* Card Total Orders */}
                    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 border-b-4 border-blue-500 hover:shadow-xl transition duration-300 ease-in-out">
                        <div className="p-3 bg-blue-500 text-white rounded-full">
                            <ShoppingCartIcon className="h-7 w-7" /> {/* Ikon */}
                        </div>
                        <div>
                            <h2 className="text-md font-medium text-gray-500">Total Orders</h2>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_orders}</p>
                        </div>
                    </div>

                    {/* Card Total Sales */}
                    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 border-b-4 border-green-500 hover:shadow-xl transition duration-300 ease-in-out">
                        <div className="p-3 bg-green-500 text-white rounded-full">
                            <TagIcon className="h-7 w-7" /> {/* Ikon */}
                        </div>
                        <div>
                            <h2 className="text-md font-medium text-gray-500">Total Sales</h2>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats.total_sales)}</p>
                        </div>
                    </div>

                    {/* Card Total Users */}
                    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 border-b-4 border-yellow-500 hover:shadow-xl transition duration-300 ease-in-out">
                        <div className="p-3 bg-yellow-500 text-white rounded-full">
                            <UsersIcon className="h-7 w-7" /> {/* Ikon */}
                        </div>
                        <div>
                            <h2 className="text-md font-medium text-gray-500">Total Users</h2>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_users}</p>
                        </div>
                    </div>

                    {/* Contoh Card Total Products (jika diaktifkan di backend) */}
                    {/* {stats.total_products !== undefined && (
                        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 border-b-4 border-purple-500 hover:shadow-xl transition duration-300 ease-in-out">
                            <div className="p-3 bg-purple-500 text-white rounded-full">
                                <CubeIcon className="h-7 w-7" />
                            </div>
                            <div>
                                <h2 className="text-md font-medium text-gray-500">Total Products</h2>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_products}</p>
                            </div>
                        </div>
                    )} */}
                </div>

                {/* Quick Links Section */}
                <div className="mt-12 bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <Link to="/admin/products" className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition duration-200 ease-in-out">
                            <CubeIcon className="h-6 w-6 text-blue-600 mr-3" />
                            <span className="text-blue-800 font-medium">Manage Products</span>
                        </Link>
                        <Link to="/admin/orders" className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition duration-200 ease-in-out">
                            <ShoppingCartIcon className="h-6 w-6 text-green-600 mr-3" />
                            <span className="text-green-800 font-medium">View All Orders</span>
                        </Link>
                        <Link to="/admin/users" className="flex items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition duration-200 ease-in-out">
                            <UsersIcon className="h-6 w-6 text-yellow-600 mr-3" />
                            <span className="text-yellow-800 font-medium">Manage Users</span>
                        </Link>
                        <Link to="/admin/categories" className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition duration-200 ease-in-out">
                            <TagIcon className="h-6 w-6 text-purple-600 mr-3" />
                            <span className="text-purple-800 font-medium">Manage Categories</span>
                        </Link>
                        {/* Tambahkan link cepat lainnya jika diperlukan */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;