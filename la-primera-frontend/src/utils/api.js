import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Pastikan ini sesuai dengan URL backend Anda

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect ke halaman login hanya jika bukan di halaman login itu sendiri
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: async (userData) => {
        try {
            const response = await api.post('/register', {
                name: `${userData.firstName} ${userData.lastName}`,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                password_confirmation: userData.confirmPassword,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    login: async (credentials) => {
        try {
            const response = await api.post('/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    logout: async () => {
        try {
            const response = await api.post('/logout');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    getProfile: async () => {
        try {
            const response = await api.get('/user');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    requestPasswordReset: async (email) => {
        try {
            const response = await api.post('/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/user/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    updatePassword: async (passwordData) => {
        try {
            const payload = {
                current_password: passwordData.currentPassword,
                password: passwordData.newPassword,
                password_confirmation: passwordData.newPassword
            };
            const response = await api.put('/user/password', payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    updateAvatar: async (avatarFile) => {
        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            const response = await api.post('/user/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
};

export const productAPI = {
    getProducts: async (params = {}) => {
        try {
            const response = await api.get('/products', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    getProduct: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
};

export const categoryAPI = {
    getCategories: async (params = {}) => { // Menambahkan params untuk mendukung no_pagination dan is_active
        try {
            const response = await api.get('/categories', { params });
            return response.data; // Should return { data: [...], meta: {...}, links: {...} } if paginated
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
};

export const wishlistAPI = {
    getWishlist: async () => {
        try {
            const response = await api.get('/wishlist');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    addToWishlist: async (productId) => {
        try {
            const response = await api.post('/wishlist', { product_id: productId });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    removeFromWishlist: async (productId) => {
        try {
            const response = await api.delete(`/wishlist/${productId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
};

export const cartAPI = {
    getCart: async () => {
        try {
            const response = await api.get('/cart');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    addItem: async (payload) => {
        try {
            const response = await api.post('/cart', payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    updateItem: async (cartItemId, payload) => {
        try {
            const response = await api.patch(`/cart/items/${cartItemId}`, payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    removeItem: async (cartItemId) => {
        try {
            const response = await api.delete(`/cart/items/${cartItemId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    clearCart: async () => {
        try {
            const response = await api.post('/cart/clear'); 
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    }
};

export const orderAPI = {
    getOrders: async (params = {}) => { // Menambahkan params untuk filter/pagination
        try {
            const response = await api.get('/orders', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    getOrderDetails: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    createOrder: async (orderPayload) => {
        try {
            const response = await api.post('/orders', orderPayload);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    cancelOrder: async (orderId) => {
        try {
            const response = await api.patch(`/orders/${orderId}/cancel`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    deleteOrder: async (orderId) => {
        try {
            const response = await api.delete(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
};

// ==========================================================
//            ADMIN API SERVICES
// ==========================================================
export const adminAPI = {
    // NEW: Get Dashboard Statistics
    getDashboardStats: async () => {
        try {
            const response = await api.get('/admin/dashboard-stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    // PRODUCTS
    getProducts: async (params = {}) => {
        try {
            const response = await api.get('/admin/products', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    getProduct: async (id) => {
        try {
            const response = await api.get(`/admin/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    // SIMPLIFIED createProduct - only essential fields
    // UPDATED createProduct - handles size variants properly
    createProduct: async (productData) => {
        try {
            const formData = new FormData();
            
            for (const key in productData) {
                if (key === 'category_ids' && Array.isArray(productData[key])) {
                    productData[key].forEach(id => formData.append('category_ids[]', id));
                } else if (key === 'images' && Array.isArray(productData[key])) {
                    productData[key].forEach(file => formData.append('images[]', file));
                } else if (key === 'size_variants' && Array.isArray(productData[key])) {
                    // Handle size variants array
                    productData[key].forEach((variant, index) => {
                        formData.append(`size_variants[${index}][size]`, variant.size);
                        formData.append(`size_variants[${index}][stock_quantity]`, variant.stock_quantity);
                    });
                } else if (productData[key] !== null && productData[key] !== undefined) {
                    formData.append(key, productData[key]);
                }
            }

            const response = await api.post('/admin/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
     // UPDATED updateProduct - handles size variants properly  
    updateProduct: async (id, productData) => {
        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');

            // Loop through productData and add to FormData
            for (const key in productData) {
                // Handle array fields
                if (key === 'category_ids' && Array.isArray(productData[key])) {
                    productData[key].forEach(val => formData.append('category_ids[]', val));
                } else if (key === 'new_images' && Array.isArray(productData[key])) {
                    productData[key].forEach(file => formData.append('new_images[]', file));
                } else if (key === 'existing_image_ids_to_delete' && Array.isArray(productData[key])) {
                    productData[key].forEach(idToDelete => formData.append('existing_image_ids_to_delete[]', idToDelete));
                } else if (key === 'size_variants' && Array.isArray(productData[key])) {
                    // Handle size variants array
                    productData[key].forEach((variant, index) => {
                        formData.append(`size_variants[${index}][size]`, variant.size);
                        formData.append(`size_variants[${index}][stock_quantity]`, variant.stock_quantity);
                    });
                } else if (productData[key] !== null && productData[key] !== undefined) {
                    // Convert boolean to string '1' or '0' for Laravel validation
                    if (typeof productData[key] === 'boolean') {
                        formData.append(key, productData[key] ? '1' : '0');
                    } else if (typeof productData[key] === 'object' && productData[key] !== null) {
                        // If there are object attributes, stringify
                        formData.append(key, JSON.stringify(productData[key]));
                    } else {
                        formData.append(key, productData[key]);
                    }
                }
            }

            // Add existing_image_primary_id separately as it might be null
            if (productData.existing_image_primary_id !== null && productData.existing_image_primary_id !== undefined) {
                formData.append('existing_image_primary_id', productData.existing_image_primary_id);
            } else if (productData.existing_image_primary_id === null) {
                 formData.append('existing_image_primary_id', ''); // Send empty string for null
            }

            const response = await api.post(`/admin/products/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/admin/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    // ORDERS
    getOrders: async (params = {}) => {
        try {
            const response = await api.get('/admin/orders', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    getOrder: async (id) => {
        try {
            const response = await api.get(`/admin/orders/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    updateOrderStatus: async (id, statusData) => { // statusData = { status: 'shipped', tracking_number: 'XYZ' }
        try {
            const response = await api.patch(`/admin/orders/${id}/status`, statusData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    deleteOrder: async (id) => {
        try {
            const response = await api.delete(`/admin/orders/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    // USERS
    getUsers: async (params = {}) => {
        try {
            const response = await api.get('/admin/users', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    getUser: async (id) => {
        try {
            const response = await api.get(`/admin/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    createUser: async (userData) => {
        try {
            const response = await api.post('/admin/users', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/admin/users/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/admin/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    // CATEGORIES
    getCategories: async (params = {}) => {
        try {
            const response = await api.get('/admin/categories', { params });
            return response.data; // Should return { data: [...], meta: {...}, links: {...} } if paginated
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    getCategory: async (id) => {
        try {
            const response = await api.get(`/admin/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    createCategory: async (categoryData) => {
        try {
            const formData = new FormData();
            for (const key in categoryData) {
                if (key === 'image' && categoryData[key] instanceof File) {
                    formData.append(key, categoryData[key]);
                } else if (categoryData[key] !== null && categoryData[key] !== undefined) {
                    formData.append(key, categoryData[key]);
                }
            }
            formData.set('is_active', categoryData.is_active ? '1' : '0'); // Explicit boolean to string

            const response = await api.post('/admin/categories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    updateCategory: async (id, categoryData) => {
        try {
            const formData = new FormData();
            formData.append('_method', 'POST'); // Laravel convention for PUT/PATCH with file uploads

            for (const key in categoryData) {
                if (key === 'image' && categoryData[key] instanceof File) {
                    formData.append(key, categoryData[key]);
                } else if (key === 'image' && categoryData[key] === null) {
                    formData.append('clear_image', '1'); // Tell backend to remove image
                } else if (categoryData[key] !== null && categoryData[key] !== undefined) {
                    formData.append(key, categoryData[key]);
                }
            }
            if (categoryData.is_active !== undefined) formData.set('is_active', categoryData.is_active ? '1' : '0');

            const response = await api.post(`/admin/categories/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
    deleteCategory: async (id) => {
        try {
            const response = await api.delete(`/admin/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },
};

// Add this to your existing utils/api.js file

export const rajaOngkirAPI = {
    // Get all provinces
    getProvinces: async () => {
        try {
            const response = await api.get('/rajaongkir/provinces');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    // Get cities by province ID
    getCities: async (provinceId) => {
        try {
            const response = await api.get('/rajaongkir/cities', {
                params: { province_id: provinceId }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    // Calculate shipping cost for specific courier
    calculateShippingCost: async (destinationCityId, weight, courier = null) => {
        try {
            const payload = {
                destination_city_id: destinationCityId,
                weight: weight
            };
            if (courier) {
                payload.courier = courier;
            }

            const response = await api.post('/rajaongkir/shipping-cost', payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    // Get shipping options for checkout (simplified format)
    getShippingOptions: async (destinationCityId, totalWeight = null) => {
        try {
            const payload = {
                destination_city_id: destinationCityId
            };
            if (totalWeight) {
                payload.total_weight = totalWeight;
            }

            const response = await api.post('/rajaongkir/shipping-options', payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    }
};