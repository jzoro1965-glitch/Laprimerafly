// src/pages/Login.jsx 
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import logoProduk from '../assets/img/logo.PNG';

function Login() {
    const { login, loading, requestPasswordReset } = useAuth(); // Perhatikan: loading di sini adalah loading untuk login/register, bukan authLoading global
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false); // State ini tidak digunakan di AuthController, hanya untuk UI
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');

        try {
            // Memanggil fungsi login dari useAuth, yang berinteraksi dengan authAPI.login
            const response = await login({ email: formData.email, password: formData.password });

            if (response.success) { // Respons dari useAuth.login sekarang langsung berupa { success: true }
                // useAuth.login sudah menangani penyimpanan token dan user ke local storage
                // useAuth.user sekarang sudah diupdate
                setSuccessMessage('Login berhasil! Anda akan diarahkan...');

                // Logika pengalihan berdasarkan peran user
                // Ambil user dari useAuth context setelah login sukses
                // Pastikan useAuth mengembalikan user yang sudah diupdate
                // Atau, akses role dari data yang dikirim oleh `login` function
                const loggedInUser = JSON.parse(localStorage.getItem('user')); // Ambil dari local storage yang sudah diupdate oleh useAuth

                if (loggedInUser && loggedInUser.role === 'admin') {
                    setTimeout(() => navigate('/admin/dashboard'), 1500); // Arahkan ke dashboard admin
                } else {
                    setTimeout(() => navigate('/'), 1500); // Arahkan ke halaman utama/dashboard user biasa
                }
            } else {
                // Ini seharusnya tidak terpanggil jika useAuth.login melempar error pada kegagalan
                setErrors({ general: response.message || 'Login gagal.' });
            }
        } catch (error) {
            console.error('Login Error:', error);
            // Menangani error dari API atau useAuth
            if (error?.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error?.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else if (error?.message?.includes('Network Error')) {
                setErrors({ general: 'Gagal terhubung ke server. Pastikan koneksi internet dan backend Anda berjalan.' });
            } else {
                setErrors({ general: error.message || 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.' });
            }
        }
    };

    const handleForgotPassword = async () => {
        const email = prompt("Masukkan alamat email Anda untuk reset password:");
        if (email) {
            setErrors({});
            setSuccessMessage('');
            try {
                const result = await requestPasswordReset(email);
                if (result.success) {
                    setSuccessMessage(result.message);
                } else {
                    setErrors({ general: result.error?.message || 'Gagal mengirim link reset.' });
                }
            } catch (err) {
                 setErrors({ general: err.response?.data?.message || err.message || 'Gagal mengirim link reset.' });
            }
        }
    };

    const renderError = (fieldName) => {
        if (errors[fieldName]) {
            const errorMessage = Array.isArray(errors[fieldName]) ? errors[fieldName][0] : errors[fieldName];
            return <p className="mt-1 text-sm text-red-600">{errorMessage}</p>;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6 overflow-hidden bg-white">
                     <img src={logoProduk} alt="Logo Produk" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
                    <p className="text-gray-600"></p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-800 text-sm">{successMessage}</p></div>
                    )}
                    {errors.general && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-800 text-sm">{errors.general}</p></div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300`} placeholder="john@example.com" required/>
                            {renderError('email')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} className={`w-full px-4 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300`} placeholder="••••••••" required/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.27 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM10 12a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>}
                                </button>
                            </div>
                            {renderError('password')}
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"/>
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Ingat saya</label>
                            </div>
                            <button type="button" onClick={handleForgotPassword} className="text-sm text-red-600 hover:text-red-500 font-medium">Lupa password?</button>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-gray-500/25 flex items-center justify-center">
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Memproses...
                                </>
                            ) : 'Masuk ke Akun'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Belum punya akun?
                            <Link to="/register" className="ml-1 text-red-600 hover:text-red-500 font-medium">Daftar sekarang</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;