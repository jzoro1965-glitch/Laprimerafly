// src/hooks/useCart.jsx
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './useAuth';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { isAuthenticated, logout } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isUpdating, setIsUpdating] = useState(null);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCartItems([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await cartAPI.getCart();
            console.log('Cart API response:', response); // ← ADD DEBUG
            setCartItems(response.data);
        } catch (error) {
            console.error("Gagal memuat keranjang:", error);
            if (error?.response?.status === 401) {
                logout();
                throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
            }
            setCartItems([]);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, logout]);

    useEffect(() => {
        fetchCart().catch(console.error);
    }, [fetchCart]);

    // FIXED: Fungsi utama addToCart dengan debug logging
    const addToCart = async (productOrPayload, quantity = 1, options = null) => {
        if (!isAuthenticated) {
            throw new Error("Silakan login untuk menambahkan produk ke keranjang.");
        }

        setIsAdding(true);
        
        try {
            let payload;

            // Deteksi format input dan normalisasi
            if (typeof productOrPayload === 'object' && productOrPayload.product_id) {
                // Format dari ProductDetailModal: { product_id, quantity, product_options }
                payload = productOrPayload;
                console.log('AddToCart - Format ProductDetailModal:', payload);
            } else if (typeof productOrPayload === 'object' && productOrPayload.id) {
                // Format dari Shop: product object
                payload = {
                    product_id: productOrPayload.id,
                    quantity: quantity,
                    product_options: options || []  // ← FIXED: Default ke array kosong
                };
                console.log('AddToCart - Format Shop Product:', payload);
            } else if (typeof productOrPayload === 'number' || typeof productOrPayload === 'string') {
                // Format langsung product ID
                payload = {
                    product_id: productOrPayload,
                    quantity: quantity,
                    product_options: options || []  // ← FIXED: Default ke array kosong
                };
                console.log('AddToCart - Format Product ID:', payload);
            } else {
                throw new Error("Format produk tidak valid");
            }

            // FIXED: Validate payload before sending
            if (!payload.product_id) {
                throw new Error("Product ID is required");
            }
            
            if (!payload.quantity || payload.quantity < 1) {
                throw new Error("Quantity must be at least 1");
            }

            // Ensure product_options is always an array
            if (!Array.isArray(payload.product_options)) {
                payload.product_options = [];
            }

            console.log('Final payload sent to backend:', payload);

            const response = await cartAPI.addItem(payload);
            console.log('Backend response:', response);
            
            await fetchCart();
            
            return { success: true };
        } catch (error) {
            console.error("Gagal menambah ke keranjang:", error);
            console.error("Error details:", error.response?.data);
            
            if (error?.response?.status === 401) {
                logout();
                throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
            } else if (error?.response?.status === 422) {
                const validationErrors = error.response?.data?.errors;
                if (validationErrors) {
                    const errorMessages = Object.values(validationErrors).flat();
                    throw new Error(errorMessages.join(', '));
                }
                throw new Error("Data produk tidak valid atau stok tidak mencukupi.");
            } else if (error.message) {
                throw error;
            } else {
                throw new Error("Gagal menambahkan produk ke keranjang.");
            }
        } finally {
            setIsAdding(false);
        }
    };

    const updateQuantityInCart = async (cartItemId, newQuantity) => {
        if (!isAuthenticated) {
            throw new Error("Silakan login untuk mengubah keranjang.");
        }
        
        setIsUpdating(cartItemId);
        try {
            if (newQuantity < 1) {
                await cartAPI.removeItem(cartItemId);
            } else {
                await cartAPI.updateItem(cartItemId, { quantity: newQuantity });
            }
            await fetchCart();
        } catch (error) {
            console.error("Gagal memperbarui kuantitas keranjang:", error);
            if (error?.response?.status === 401) {
                logout();
                throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
            } else if (error?.response?.status === 403) {
                throw new Error("Anda tidak memiliki izin untuk mengubah item keranjang ini.");
            } else {
                throw new Error("Gagal memperbarui kuantitas produk di keranjang.");
            }
        } finally {
            setIsUpdating(null);
        }
    };

    const removeFromCart = async (cartItemId) => {
        if (!isAuthenticated) {
            throw new Error("Silakan login untuk menghapus produk dari keranjang.");
        }
        
        setLoading(true);
        try {
            await cartAPI.removeItem(cartItemId);
            await fetchCart();
        } catch (error) {
            console.error("Gagal menghapus produk dari keranjang:", error);
            if (error?.response?.status === 401) {
                logout();
                throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
            } else {
                throw new Error("Gagal menghapus produk dari keranjang.");
            }
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated) {
            throw new Error("Silakan login untuk mengosongkan keranjang.");
        }
        
        setLoading(true);
        try {
            await cartAPI.clearCart();
            setCartItems([]);
        } catch (error) {
            console.error("Gagal mengosongkan keranjang:", error);
            if (error?.response?.status === 401) {
                logout();
                throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
            } else {
                throw new Error("Gagal mengosongkan keranjang.");
            }
        } finally {
            setLoading(false);
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const totalItems = cartItems.length;
    const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const value = {
        cartItems,
        loading,
        isAdding,
        isUpdating,
        subtotal,
        totalItems,
        totalQty,
        addToCart,
        updateQuantityInCart,
        removeFromCart,
        clearCart,
        fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};