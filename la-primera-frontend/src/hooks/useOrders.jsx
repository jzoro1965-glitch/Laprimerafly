// src/hooks/useOrders.jsx
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { orderAPI } from '../utils/api';
import { useAuth } from './useAuth';

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        if (!isAuthenticated) {
            setOrders([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await orderAPI.getOrders();
            setOrders(response.data);
        } catch (err) {
            console.error("Gagal memuat pesanan:", err);
            setError("Gagal memuat riwayat pesanan Anda.");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Fungsi untuk membatalkan pesanan
    const cancelOrder = async (orderId) => {
        try {
            const response = await orderAPI.cancelOrder(orderId);
            if (response.success) {
                alert(response.message);
                fetchOrders(); // Refresh daftar pesanan setelah pembatalan
            }
        } catch (err) {
            console.error("Gagal membatalkan pesanan:", err);
            alert(err.response?.data?.message || "Terjadi kesalahan saat membatalkan pesanan."); // Lebih baik menampilkan pesan dari backend
        }
    };

    // Fungsi untuk menghapus pesanan
    const deleteOrder = async (orderId) => {
        try {
            const response = await orderAPI.deleteOrder(orderId);
            if (response.success) {
                alert(response.message);
                fetchOrders(); // Refresh daftar pesanan setelah penghapusan
            }
        } catch (err) {
            console.error("Gagal menghapus pesanan:", err);
            alert(err.response?.data?.message || "Terjadi kesalahan saat menghapus pesanan."); // Lebih baik menampilkan pesan dari backend
        }
    };

    const value = { 
        orders, 
        loading, 
        error,
        cancelOrder, // Tambahkan ke context
        deleteOrder  // Tambahkan ke context
    };

    return (
        <OrdersContext.Provider value={value}>
            {children}
        </OrdersContext.Provider>
    );
};

export const useOrders = () => {
    return useContext(OrdersContext);
};