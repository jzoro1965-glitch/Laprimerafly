// src/layouts/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar'; // Asumsi Anda punya komponen Navbar
import Footer from '../components/common/Footer'; // Asumsi Anda punya komponen Footer

function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet /> {/* Ini akan merender konten halaman yang sesuai dengan rute */}
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;