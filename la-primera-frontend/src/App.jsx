// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'; // Hapus 'BrowserRouter as Router'

// Import AuthProvider dan useAuth dari hook kustom Anda
import { AuthProvider, useAuth } from './hooks/useAuth';

// Import Layouts (Navbar dan Footer dari components/common)
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Import Halaman Publik yang sudah ada dari kode asli Anda
import Home from './pages/Home';
import Lookbook from './pages/Lookbook';
import About from './pages/About';
import Contact from './pages/Contact';
import Shop from './pages/Shop';

// Import Halaman Autentikasi yang sudah ada dari kode asli Anda
import Login from './pages/Login';
import Register from './pages/Register';
// >>> CATATAN: ForgotPassword dan ResetPassword DIHAPUS SESUAI INSTRUKSI ANDA <<<
// import ForgotPassword from './pages/Auth/ForgotPassword';
// import ResetPassword from './pages/Auth/ResetPassword';

// Import Halaman User Terautentikasi yang sudah ada dari kode asli Anda
import Checkout from './pages/Checkout';
import Profile from './pages/dropdown/ProfileSettings';
import Orders from './pages/dropdown/MyOrders';
import Wishlist from './pages/dropdown/WishList';

// Import Halaman Admin BARU (Path dikoreksi)
// Asumsi: Semua komponen admin berada di dalam 'src/components/admin/'
import AdminDashboard from './components/admin/Dashboard';
import AdminProductList from './components/admin/products/ProductList';
import AdminProductCreate from './components/admin/products/ProductCreate';
import AdminProductEdit from './components/admin/products/ProductEdit';
import AdminOrderList from './components/admin/orders/OrderList';
import AdminOrderDetail from './components/admin/orders/OrderDetail';
import AdminUserList from './components/admin/users/UserList';
import AdminCategoryList from './components/admin/categories/CategoryList';


// ==============================================================================
// Komponen Pembantu: ProtectedRoute
// Fungsinya adalah untuk melindungi rute berdasarkan status autentikasi dan peran user.
// ==============================================================================
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        console.warn(`Access denied. User role '${user?.role}' is not in allowed roles: ${allowedRoles.join(', ')}`);
        return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/'} replace />;
    }

    return children;
};

// ==============================================================================
// Komponen Utama App
// Mengatur struktur routing aplikasi menggunakan React Router DOM.
// ==============================================================================
function App() {
  return (
    // <Router> --> TAG INI DIHAPUS!!!
        <AuthProvider>
            <div className="App">
                <Navbar />
                <Routes>
                    {/* ==================================================================
                    Rute Publik & Rute User Biasa (menggunakan Navbar/Footer langsung)
                    ==================================================================
                    */}
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/lookbook" element={<Lookbook />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    
                    {/* Rute Autentikasi */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    {/* >>> CATATAN: Rute ForgotPassword dan ResetPassword DIHAPUS <<< */}
                    {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
                    {/* <Route path="/reset-password" element={<ResetPassword />} /> */}

                    {/* Rute yang memerlukan autentikasi (untuk user biasa maupun admin) */}
                    <Route path="/checkout" element={<ProtectedRoute allowedRoles={['user', 'admin']}><Checkout /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'admin']}><Profile /></ProtectedRoute>} />
                    <Route path="/my-orders" element={<ProtectedRoute allowedRoles={['user', 'admin']}><Orders /></ProtectedRoute>} />
                    <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['user', 'admin']}><Wishlist /></ProtectedRoute>} />

                    {/* ==================================================================
                    Rute Admin (dilindungi)
                    ==================================================================
                    */}
                    <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><AdminProductList /></ProtectedRoute>} />
                    <Route path="/admin/products/create" element={<ProtectedRoute allowedRoles={['admin']}><AdminProductCreate /></ProtectedRoute>} />
                    <Route path="/admin/products/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminProductEdit /></ProtectedRoute>} />
                    <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrderList /></ProtectedRoute>} />
                    <Route path="/admin/orders/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrderDetail /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserList /></ProtectedRoute>} />
                    <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['admin']}><AdminCategoryList /></ProtectedRoute>} />

                    {/* Catch-all Route untuk Halaman Tidak Ditemukan (404) */}
                    <Route path="*" element={<div>404 Not Found: Page not found.</div>} />
                </Routes>
                <Footer />
            </div>
        </AuthProvider>
    // </Router> --> TAG INI DIHAPUS!!!
  );
}

export default App;