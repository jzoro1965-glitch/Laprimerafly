// src/pages/dropdown/MyOrders.jsx 
import { useState, Fragment } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../components/shop/utils/Formatters';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

function MyOrders() {
    const { orders, loading, error, cancelOrder, deleteOrder, refreshOrders } = useOrders();
    const [activeTab, setActiveTab] = useState('all');
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentProcessingOrderId, setPaymentProcessingOrderId] = useState(null);

    /**
     * ADDED: Helper function to extract size and color from product options
     */
    const extractProductVariants = (productOptions, product) => {
        let selectedSize = null;
        let selectedColor = null;
        
        if (!productOptions) {
            // Fallback to product colors if no options
            selectedColor = product?.colors || null;
            return { selectedSize, selectedColor };
        }

        try {
            let options = {};
            
            // Parse if string
            if (typeof productOptions === 'string') {
                options = JSON.parse(productOptions);
            } else if (typeof productOptions === 'object') {
                options = productOptions;
            }

            // Handle array format: [{"name": "Ukuran", "value": "L"}]
            if (Array.isArray(options)) {
                options.forEach(option => {
                    if (option.name && option.value) {
                        const optionName = option.name.toLowerCase();
                        if (['ukuran', 'size', 'sizes'].includes(optionName)) {
                            selectedSize = option.value;
                        } else if (['warna', 'color', 'colors'].includes(optionName)) {
                            selectedColor = option.value;
                        }
                    }
                });
            }
            // Handle object format: {"Ukuran": "L", "Warna": "Red"}
            else if (typeof options === 'object') {
                // Check for size
                const sizeKeys = ['Ukuran', 'ukuran', 'Size', 'size', 'sizes'];
                for (const key of sizeKeys) {
                    if (options[key]) {
                        selectedSize = options[key];
                        break;
                    }
                }
                
                // Check for color
                const colorKeys = ['Warna', 'warna', 'Color', 'color', 'colors'];
                for (const key of colorKeys) {
                    if (options[key]) {
                        selectedColor = options[key];
                        break;
                    }
                }
            }
            
            // Fallback to product colors if no color in options
            if (!selectedColor && product?.colors) {
                selectedColor = product.colors;
            }
            
        } catch (error) {
            console.error('Error parsing product options:', error);
            // Fallback to product colors
            selectedColor = product?.colors || null;
        }
        
        return { selectedSize, selectedColor };
    };

    /**
     * Mengembalikan kelas CSS untuk warna status pesanan.
     */
    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    /**
     * Mengembalikan teks status pesanan yang lebih mudah dibaca.
     */
    const getStatusText = (status) => {
        const statusMap = {
            delivered: 'Terkirim',
            shipped: 'Dikirim',
            processing: 'Diproses',
            cancelled: 'Dibatalkan',
            pending: 'Menunggu Pembayaran'
        };
        return statusMap[status] || 'Tidak Diketahui';
    };

    /**
     * Memfilter daftar pesanan berdasarkan tab aktif.
     */
    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        return order.status === activeTab;
    });

    /**
     * Memformat string tanggal menjadi format yang mudah dibaca lokal (id-ID).
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            console.error("Invalid date string:", dateString, e);
            return 'Invalid Date';
        }
    };

    /**
     * PERBAIKAN: Fungsi untuk mendapatkan total amount yang valid
     * Menggunakan fallback dan validasi yang lebih ketat
     */
    const getValidTotalAmount = (order) => {
        // Coba ambil dari total_amount terlebih dahulu
        let total = order.total_amount;
        
        // Jika total_amount tidak ada atau invalid, hitung dari order items
        if (!total || isNaN(parseFloat(total))) {
            console.warn('total_amount tidak valid untuk order:', order.id, 'nilai:', total);
            
            // Hitung manual dari order items
            const itemsTotal = (order.order_items || []).reduce((sum, item) => {
                const itemTotal = parseFloat(item.total_price) || (parseFloat(item.unit_price) * parseInt(item.quantity)) || 0;
                return sum + itemTotal;
            }, 0);
            
            total = itemsTotal;
        }
        
        // Pastikan total adalah number yang valid
        const numericTotal = parseFloat(total);
        return isNaN(numericTotal) ? 0 : numericTotal;
    };

    /**
     * PERBAIKAN: Fungsi untuk mendapatkan jumlah item yang valid
     */
    const getValidItemCount = (order) => {
        if (!order.order_items || !Array.isArray(order.order_items)) {
            return 0;
        }
        
        return order.order_items.reduce((total, item) => {
            const quantity = parseInt(item.quantity) || 0;
            return total + quantity;
        }, 0);
    };

    /**
     * PERBAIKAN: Fungsi untuk mendapatkan unit price yang valid
     */
    const getValidUnitPrice = (item) => {
        const price = parseFloat(item.unit_price);
        return isNaN(price) ? 0 : price;
    };

    const handleCancelClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (selectedOrderId) {
            await cancelOrder(selectedOrderId);
            setSelectedOrderId(null);
            setIsCancelModalOpen(false);
        }
    };

    const handleDeleteClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedOrderId) {
            await deleteOrder(selectedOrderId);
            setSelectedOrderId(null);
            setIsDeleteModalOpen(false);
        }
    };

    // IMPROVED handlePayNow function in MyOrders.jsx
const handlePayNow = async (order) => {
    // Validate payment method
    if (order.payment_method !== 'midtrans') {
        console.error('Invalid payment method for Pay Now:', order.payment_method);
        alert('Metode pembayaran tidak valid untuk pembayaran online.');
        return;
    }

    // Check if already processing payment
    if (isProcessingPayment) {
        console.warn('Payment already in progress');
        return;
    }

    setIsProcessingPayment(true);
    setPaymentProcessingOrderId(order.id);

    try {
        // If snap token is missing, request a new one from backend
        let snapToken = order.snap_token;
        
        if (!snapToken) {
            console.log('Snap token missing, requesting new token for order:', order.id);
            
            try {
                const response = await fetch(`/api/orders/${order.id}/regenerate-payment-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Adjust based on your auth implementation
                        'Accept': 'application/json',
                    },
                });

                const data = await response.json();
                
                if (response.ok && data.success && data.snap_token) {
                    snapToken = data.snap_token;
                    console.log('New snap token received');
                } else {
                    throw new Error(data.message || 'Failed to generate payment token');
                }
            } catch (error) {
                console.error('Failed to regenerate payment token:', error);
                setIsProcessingPayment(false);
                setPaymentProcessingOrderId(null);
                alert('Gagal membuat token pembayaran baru. Silakan hubungi customer service atau coba lagi nanti.');
                return;
            }
        }

        // Validate Midtrans Snap is loaded
        if (!window.snap) {
            console.error('Midtrans Snap not loaded');
            setIsProcessingPayment(false);
            setPaymentProcessingOrderId(null);
            alert('Sistem pembayaran belum siap. Silakan refresh halaman dan coba lagi.');
            return;
        }

        // Process payment with snap token
        window.snap.pay(snapToken, {
            onSuccess: function(result) {
                console.log('Payment success:', result);
                setIsProcessingPayment(false);
                setPaymentProcessingOrderId(null);
                
                // Refresh orders to get updated status
                refreshOrders();
                
                // Show success message
                alert('Pembayaran berhasil! Status pesanan akan segera diperbarui.');
            },
            onPending: function(result) {
                console.log('Payment pending:', result);
                setIsProcessingPayment(false);
                setPaymentProcessingOrderId(null);
                
                // Refresh orders to get updated status
                refreshOrders();
                
                // Show pending message
                alert('Pembayaran sedang diproses. Status pesanan akan diperbarui setelah konfirmasi pembayaran.');
            },
            onError: function(result) {
                console.error('Payment failed:', result);
                setIsProcessingPayment(false);
                setPaymentProcessingOrderId(null);
                
                alert('Pembayaran gagal. Silakan coba lagi atau hubungi customer service.');
            },
            onClose: function() {
                console.log('Payment popup closed');
                setIsProcessingPayment(false);
                setPaymentProcessingOrderId(null);
                
                // Optional: Refresh orders in case payment was completed
                // but we didn't get the callback
                setTimeout(() => {
                    refreshOrders();
                }, 2000);
            }
        });

    } catch (error) {
        console.error('Error opening payment:', error);
        setIsProcessingPayment(false);
        setPaymentProcessingOrderId(null);
        alert('Gagal membuka pembayaran. Silakan coba lagi.');
    }
};

    // DEBUG: Log orders untuk debugging
    console.log('Orders data:', orders);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat pesanan Anda...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header halaman Pesanan Saya */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
                            <p className="text-gray-600 mt-1">Kelola dan lacak semua pesanan Anda</p>
                        </div>
                        <Link to="/shop" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium">Belanja Lagi</Link>
                    </div>
                </div>
            </div>

            {/* Bagian filter tab status pesanan */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="flex space-x-0 overflow-x-auto">
                        <button onClick={() => setActiveTab('all')} className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'all' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500'}`}>Semua</button>
                        <button onClick={() => setActiveTab('pending')} className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'pending' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500'}`}>Menunggu Pembayaran</button>
                        <button onClick={() => setActiveTab('processing')} className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'processing' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500'}`}>Diproses</button>
                        <button onClick={() => setActiveTab('shipped')} className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'shipped' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500'}`}>Dikirim</button>
                        <button onClick={() => setActiveTab('delivered')} className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'delivered' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500'}`}>Terkirim</button>
                        <button onClick={() => setActiveTab('cancelled')} className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'cancelled' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500'}`}>Dibatalkan</button>
                    </div>
                </div>
                
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <p className="text-gray-600">Anda belum memiliki pesanan dalam kategori ini.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            // PERBAIKAN: Dapatkan nilai yang valid untuk setiap order
                            const validTotalAmount = getValidTotalAmount(order);
                            const validItemCount = getValidItemCount(order);
                            
                            // DEBUG: Log individual order data
                            console.log('Processing order:', order.id, 'total_amount:', order.total_amount, 'calculated:', validTotalAmount);
                            
                            return (
                                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="p-6">
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">#{order.order_number}</h3>
                                                    <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                                                </div>
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                                            </div>
                                            <div className="text-right">
                                                {/* PERBAIKAN: Gunakan validTotalAmount dan tambahkan fallback */}
                                                <p className="text-lg font-bold text-gray-900">
                                                    {validTotalAmount > 0 ? formatPrice(validTotalAmount) : 'Rp 0'}
                                                </p>
                                                <p className="text-sm text-gray-600">{validItemCount} item</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 border-t pt-4">
                                            {(order.order_items ?? []).map((item) => {
                                                // ADDED: Extract size and color from product options
                                                const { selectedSize, selectedColor } = extractProductVariants(
                                                    item.product_options, 
                                                    item.product
                                                );

                                                return (
                                                    <div key={item.id} className="flex items-start space-x-4">
                                                        <img 
                                                            src={item.product?.images?.[0]?.image_path || '/images/placeholder.webp'} 
                                                            alt={item.product_name || 'Produk'} 
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                            onError={(e) => {
                                                                e.target.src = '/images/placeholder.webp';
                                                            }}
                                                        />
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900">{item.product_name || 'Nama produk tidak tersedia'}</h4>
                                                            <p className="text-sm text-gray-600">Qty: {item.quantity || 0}</p>
                                                            
                                                            {/* ADDED: Display size and colors */}
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {selectedSize && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                                        </svg>
                                                                        Ukuran: {selectedSize}
                                                                    </span>
                                                                )}
                                                                {selectedColor && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                                                        </svg>
                                                                        Warna: {selectedColor}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            {/* PERBAIKAN: Validasi unit_price sebelum formatting */}
                                                            <p className="font-medium text-gray-900">
                                                                {formatPrice(getValidUnitPrice(item))}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
        
<div className="mt-4 flex justify-end gap-2 border-t pt-4">
    {/* FIXED: Logic pembayaran berdasarkan payment_method yang tersimpan */}
    {order.status === 'pending' && (
        <>
            {/* Midtrans Payment - Show Pay Now button */}
            {order.payment_method === 'midtrans' && (
                <button
                    onClick={() => handlePayNow(order)}
                    disabled={isProcessingPayment && paymentProcessingOrderId === order.id}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition duration-150 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isProcessingPayment && paymentProcessingOrderId === order.id ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Membuka Pembayaran...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Bayar Sekarang
                        </>
                    )}
                </button>
            )}

            {/* COD Orders - Show status badge instead of payment button */}
            {order.payment_method === 'cod' && (
                <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    COD - Bayar saat diterima
                </span>
            )}
        </>
    )}

    {/* Cancel button - available for pending and processing orders */}
    {['pending', 'processing'].includes(order.status) && (
        <button
            onClick={() => handleCancelClick(order.id)}
            disabled={isProcessingPayment && paymentProcessingOrderId === order.id}
            className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition duration-150 disabled:bg-yellow-400 disabled:cursor-not-allowed"
        >
            Batalkan Pesanan
        </button>
    )}
    
    {/* Delete button - only for cancelled orders */}
    {order.status === 'cancelled' && (
        <button
            onClick={() => handleDeleteClick(order.id)}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition duration-150"
        >
            Hapus Pesanan
        </button>
    )}
</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Konfirmasi Pembatalan Pesanan */}
            {/* // FIXED: Cancel Order Modal - around line 640 in your MyOrders.jsx */}
<Transition appear show={isCancelModalOpen} as={Fragment}>
    <Dialog as="div" className="relative z-10" onClose={() => setIsCancelModalOpen(false)}>
        <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <DialogTitle as="h3" className="text-lg font-medium text-gray-900">
                            Konfirmasi Pembatalan Pesanan
                        </DialogTitle>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan jika pesanan sudah diproses lebih lanjut.
                            </p>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                onClick={() => setIsCancelModalOpen(false)}
                            >
                                Tidak
                            </button>
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                                onClick={handleConfirmCancel}
                            >
                                Ya, Batalkan Pesanan
                            </button>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </div>
        </div>
    </Dialog>
</Transition>

{/* // ALSO NEED TO ADD: Delete Order Modal (this should be separate) */}
<Transition appear show={isDeleteModalOpen} as={Fragment}>
    <Dialog as="div" className="relative z-10" onClose={() => setIsDeleteModalOpen(false)}>
        <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <DialogTitle as="h3" className="text-lg font-medium text-gray-900">
                            Konfirmasi Penghapusan Pesanan
                        </DialogTitle>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Apakah Anda yakin ingin menghapus pesanan ini secara permanen? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Tidak
                            </button>
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                onClick={handleConfirmDelete}
                            >
                                Ya, Hapus Permanen
                            </button>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </div>
        </div>
    </Dialog>
</Transition>
        </div>
    );
}

export default MyOrders;