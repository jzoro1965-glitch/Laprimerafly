// src/components/admin/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function AdminSidebar() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Products', path: '/admin/products', icon: '📦' },
        { name: 'Orders', path: '/admin/orders', icon: '📝' },
        { name: 'Users', path: '/admin/users', icon: '👥' },
        { name: 'Categories', path: '/admin/categories', icon: '📂' },
        // Tambahkan item navigasi lain di sini
    ];

    return (
        <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
            <div className="text-2xl font-bold mb-8 text-center">Admin Panel</div>
            <nav className="flex-1">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.name} className="mb-2">
                            <Link 
                                to={item.path} 
                                className={`flex items-center p-2 rounded-lg ${location.pathname.startsWith(item.path) ? 'bg-red-600' : 'hover:bg-gray-700'}`}
                            >
                                <span className="mr-3 text-xl">{item.icon}</span>
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto text-center text-sm text-gray-400">
                &copy; 2025 La-Primera Admin
            </div>
        </div>
    );
}

export default AdminSidebar;