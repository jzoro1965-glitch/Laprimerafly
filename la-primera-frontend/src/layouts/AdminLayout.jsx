// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar'; // Komponen sidebar admin
import AdminHeader from '../components/admin/AdminHeader'; // Komponen header admin
import { useAuth } from '../hooks/useAuth'; // Untuk menampilkan info user admin atau logout

function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar /> {/* Sidebar navigasi admin */}
      <div className="flex-1 flex flex-col">
        <AdminHeader user={user} logout={logout} /> {/* Header admin */}
        <main className="flex-1 p-6">
          <Outlet /> {/* Ini akan merender konten halaman admin yang sesuai dengan rute */}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;