// src/hooks/useAuth.jsx 
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Menggunakan state untuk token yang diinisialisasi dari localStorage
    const [token, setToken] = useState(() => localStorage.getItem('token')); 
    const [loading, setLoading] = useState(false); // Loading untuk operasi autentikasi (login/register/logout)
    const [authLoading, setAuthLoading] = useState(true); // Loading untuk inisialisasi autentikasi awal
    const navigate = useNavigate();

    // useCallback agar fetchUser tidak dibuat ulang setiap render jika dependencies tidak berubah
    const fetchUser = useCallback(async () => {
        setLoading(true); // Set loading untuk operasi fetch user
        try {
            // Panggil API getProfile untuk mendapatkan data user terbaru
            const response = await authAPI.getProfile(); 
            if (response.success && response.data) {
                setUser(response.data); // Set user dari data API
                // Simpan juga di localStorage agar konsisten
                localStorage.setItem('user', JSON.stringify(response.data)); 
            } else {
                // Jika API tidak sukses, anggap token tidak valid
                throw new Error(response.message || 'Failed to fetch user profile.');
            }
        } catch (error) {
            console.error('Failed to fetch user profile or token invalid:', error);
            // Hapus token dan user dari localStorage jika ada error
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            // Tidak perlu navigate di sini, biarkan ProtectedRoute yang menangani redirect jika isAuthenticated menjadi false
        } finally {
            setLoading(false);
        }
    }, []);

    // Inisialisasi autentikasi saat komponen dimuat
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                await fetchUser(); // Coba ambil user profile jika ada token
            }
            setAuthLoading(false); // Setelah inisialisasi selesai, set authLoading ke false
        };
        initAuth();
    }, [token, fetchUser]); // Jalankan ulang jika token atau fetchUser berubah

    // Fungsi login
    const login = async (credentials) => {
        setLoading(true);
        try {
            const response = await authAPI.login(credentials);
            if (response.success && response.data) {
                const userData = response.data.user;
                const userToken = response.data.access_token;
                
                setUser(userData);
                setToken(userToken);
                localStorage.setItem('token', userToken);
                localStorage.setItem('user', JSON.stringify(userData)); // Simpan data user lengkap
                
                return { success: true };
            }
            // Jika API return success: false atau data tidak lengkap, lempar error
            throw new Error(response.message || 'Login failed: Invalid response from server.');
        } catch (error) {
            console.error('Login error:', error);
            // Lempar error agar komponen Login bisa menanganinya
            throw error; 
        } finally {
            setLoading(false);
        }
    };

    // Fungsi register (sama seperti login dalam hal penanganan token dan user)
    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await authAPI.register(userData);
            if (response.success && response.data) {
                const newUser = response.data.user;
                const newToken = response.data.access_token;

                setUser(newUser);
                setToken(newToken);
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(newUser));

                return { success: true };
            }
            throw new Error(response.message || 'Registration failed: Invalid response from server.');
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    
    // Fungsi logout
    const logout = async () => {
        setLoading(true);
        try {
            await authAPI.logout(); // Panggil API logout di backend
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Selalu bersihkan sesi lokal terlepas dari respons API logout
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setLoading(false);
            navigate('/login'); // Redirect ke halaman login setelah logout
        }
    };
    
    const requestPasswordReset = async (email) => {
        setLoading(true);
        try {
            const response = await authAPI.requestPasswordReset(email);
            return { success: true, message: response.message };
        } catch (error) {
            console.error('Password reset error:', error);
            // Lempar error agar Login.jsx bisa menampilkan pesan spesifik dari backend
            throw error; 
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (profileData) => {
        setLoading(true);
        try {
            const response = await authAPI.updateProfile(profileData);
            if (response.success && response.data) {
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data)); // Update localStorage
                return response.data;
            }
            throw new Error(response.message || 'Failed to update profile.');
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async (passwordData) => {
        setLoading(true);
        try {
            const response = await authAPI.updatePassword(passwordData);
            if (response.success) {
                return response;
            }
            throw new Error(response.message || 'Failed to update password.');
        } catch (error) {
            console.error('Update password error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateAvatar = async (avatarFile) => {
        setLoading(true);
        try {
            const response = await authAPI.updateAvatar(avatarFile);
            if (response.success && response.data) {
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data)); // Update localStorage
                return response.data;
            }
            throw new Error(response.message || 'Failed to update avatar.');
        } catch (error) {
            console.error('Update avatar error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const value = { 
        user, 
        token, 
        loading, // Loading untuk operasi auth tertentu
        isAuthenticated: !!token && !!user, // User dianggap terautentikasi jika ada token DAN data user
        login, 
        register, 
        logout, 
        requestPasswordReset,
        updateProfile,
        updatePassword,
        updateAvatar,
        fetchUser, // Paparkan fetchUser agar bisa dipanggil manual untuk refresh
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Tampilkan children hanya setelah proses inisialisasi autentikasi selesai */}
            {!authLoading ? children : 
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Initializing authentication...</p>
                    </div>
                </div>
            }
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};