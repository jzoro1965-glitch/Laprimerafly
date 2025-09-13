// src/components/admin/AdminHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Pastikan path benar

function AdminHeader() {
  const { user, logout } = useAuth(); // Ambil user dan logout dari useAuth
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Redirect ke halaman login setelah logout
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-xl font-semibold text-gray-800">
        Welcome, {user?.name} ({user?.role}) {/* Tampilkan nama dan role user */}
      </div>
      <nav>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}

export default AdminHeader;