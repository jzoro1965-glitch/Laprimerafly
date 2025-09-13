// src/pages/Checkout.jsx - PERBAIKAN HANDLER
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { orderAPI } from '../utils/api';
import { formatPrice } from '../components/shop/utils/Formatters';
import OrderSummary from '../components/checkout/OrderSummary';
import ShippingForm from '../components/checkout/ShippingForm';
import PaymentForm from '../components/checkout/PaymentForm';

function Checkout() {
    const { cartItems, clearCart, loading: cartLoading, subtotal: cartSubtotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // State untuk RajaOngkir
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedShippingOption, setSelectedShippingOption] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '', 
        lastName: '', 
        email: '', 
        phone: '', 
        address: '',
        provinceId: '',
        cityId: '',
        districtId: '',
        postalCode: '',
        country: 'Indonesia',
        paymentMethod: 'midtrans',
        shippingOption: '',
        notes: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    // PERBAIKAN: Handler shipping options yang stabil
    const handleShippingOptionsUpdate = useCallback((options) => {
        console.log('Received shipping options in Checkout:', options);
        
        // Jika tidak ada options, reset
        if (!options || options.length === 0) {
            setShippingOptions([]);
            setSelectedShippingOption(null);
            setFormData(prev => ({ ...prev, shippingOption: '' }));
            return;
        }
        
        setShippingOptions(options);
        
        // Coba pertahankan pilihan yang sudah ada
        const currentSelection = formData.shippingOption;
        const stillAvailable = options.find(opt => opt.id === currentSelection);
        
        if (stillAvailable) {
            // Pilihan masih tersedia
            setSelectedShippingOption(stillAvailable);
        } else if (options.length > 0) {
            // Pilih yang pertama sebagai default
            const firstOption = options[0];
            setFormData(prev => ({ ...prev, shippingOption: firstOption.id }));
            setSelectedShippingOption(firstOption);
        }
    }, []); // Dependency kosong untuk mencegah perubahan

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Update selected shipping option
        if (name === 'shippingOption') {
            const selected = shippingOptions.find(opt => opt.id === value);
            setSelectedShippingOption(selected || null);
        }

        // Clear errors
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Perhitungan total
    const subtotal = cartSubtotal || 0;
    const shippingCost = selectedShippingOption?.cost || 0;
    const tax = 0; 
    const total = subtotal + shippingCost + tax;

    const validateStep = (step) => {
        const newErrors = {};
        
        if (step === 1) {
            if (!formData.firstName.trim()) newErrors.firstName = 'Nama depan wajib diisi.';
            if (!formData.lastName.trim()) newErrors.lastName = 'Nama belakang wajib diisi.';
            if (!formData.email.trim()) newErrors.email = 'Email wajib diisi.';
            if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi.';
            if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi.';
            if (!formData.provinceId.trim()) newErrors.provinceId = 'Provinsi wajib diisi.';
            if (!formData.cityId.trim()) newErrors.cityId = 'Kota wajib diisi.';
            if (!formData.districtId.trim()) newErrors.districtId = 'Kecamatan wajib diisi.';
            if (!formData.postalCode.trim()) newErrors.postalCode = 'Kode pos wajib diisi.';
            if (!formData.shippingOption.trim()) newErrors.shippingOption = 'Layanan pengiriman wajib dipilih.';
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (formData.email && !emailRegex.test(formData.email)) {
                newErrors.email = 'Format email tidak valid.';
            }
        }
        return newErrors;
    };

    const handleNextStep = () => {
        const stepErrors = validateStep(currentStep);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        setErrors({});
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setErrors({});
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        
        const finalErrors = validateStep(1);
        if (Object.keys(finalErrors).length > 0) {
            setErrors(finalErrors);
            setCurrentStep(1);
            return;
        }

        setLoading(true);
        setErrors({});

        const orderPayload = {
            shipping: {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                address: formData.address.trim(),
                province_id: formData.provinceId,
                city_id: formData.cityId,
                district_id: formData.districtId,
                postalCode: formData.postalCode.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                country: formData.country,
            },
            billing: {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                address: formData.address.trim(),
                province_id: formData.provinceId,
                city_id: formData.cityId,
                district_id: formData.districtId,
                postalCode: formData.postalCode.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                country: formData.country,
            },
            payment: {
                method: 'midtrans',
            },
            shipping_option: selectedShippingOption,
            cart_items: cartItems.map(item => {
                let productOptions = {};
                if (item.product_options) {
                    if (typeof item.product_options === 'string') {
                        try {
                            productOptions = JSON.parse(item.product_options);
                        } catch (error) {
                            productOptions = {};
                        }
                    } else if (typeof item.product_options === 'object') {
                        productOptions = item.product_options;
                    }
                }
                if (Array.isArray(productOptions)) {
                    productOptions = productOptions.reduce((acc, option) => {
                        if (option.name && option.value) {
                            acc[option.name] = option.value;
                        }
                        return acc;
                    }, {});
                }
                return {
                    product_id: parseInt(item.product?.id || item.product_id),
                    quantity: parseInt(item.quantity),
                    unit_price: parseFloat(item.unit_price || item.product?.price || 0),
                    product_options: productOptions,
                };
            }),
            subtotal_amount: parseFloat(subtotal.toFixed(2)),
            shipping_amount: parseFloat(shippingCost.toFixed(2)),
            tax_amount: parseFloat(tax.toFixed(2)),
            total_amount: parseFloat(total.toFixed(2)),
            notes: formData.notes?.trim() || '',
        };
        
        try {
            const response = await orderAPI.createOrder(orderPayload);
            if (response.success) {
                if (window.snap && response.snap_token) {
                    window.snap.pay(response.snap_token, {
                        onSuccess: function(result) {
                            clearCart();
                            navigate('/my-orders', { state: { message: 'Pembayaran berhasil! Pesanan Anda sedang diproses.', type: 'success' } });
                        },
                        onPending: function(result) {
                            clearCart();
                            navigate('/my-orders', { state: { message: 'Pembayaran tertunda. Silakan selesaikan pembayaran Anda.', type: 'warning' } });
                        },
                        onError: function(result) {
                            setErrors({ general: 'Pembayaran gagal. Silakan coba lagi.' });
                        },
                        onClose: function() {
                            navigate('/my-orders', { state: { message: 'Pesanan dibuat dengan status pending. Selesaikan pembayaran di halaman pesanan.', type: 'info' } });
                        }
                    });
                } else {
                    clearCart();
                    navigate('/my-orders', { state: { message: 'Pesanan berhasil dibuat. Silakan selesaikan pembayaran.', type: 'success' } });
                }
            } else {
                setErrors({ general: response.message || "Gagal membuat pesanan. Silakan coba lagi." });
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: error.response?.data?.message || error.message || "Terjadi kesalahan. Silakan coba lagi." });
            }
        } finally {
            setLoading(false);
        }
    };

    const ConfirmationStep = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Konfirmasi Pesanan</h2>
            
            {/* Alamat Pengiriman */}
            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Alamat Pengiriman
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
                        <p className="text-gray-600">{formData.email}</p>
                        <p className="text-gray-600">{formData.phone}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">{formData.address}</p>
                        <p className="text-gray-600">{formData.postalCode}, {formData.country}</p>
                    </div>
                </div>
            </div>

            {/* Payment & Shipping Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Pembayaran Online
                    </h3>
                    <p className="text-gray-600 font-medium">Midtrans Payment Gateway</p>
                    <p className="text-sm text-gray-500 mt-1">Transfer Bank, E-Wallet, Kartu Kredit/Debit</p>
                    <div className="mt-3 flex items-center text-sm">
                        <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-600 font-medium">Aman & Terpercaya</span>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Pengiriman
                    </h3>
                    <p className="text-gray-600">
                        {selectedShippingOption ? `${selectedShippingOption.courier} ${selectedShippingOption.service}` : 'Layanan tidak dipilih'}
                    </p>
                    <p className="text-gray-900 font-semibold mt-1">
                        {formatPrice(shippingCost)}
                    </p>
                </div>
            </div>

           {/* Cart Items */}
<div className="border border-gray-300 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-400">
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
    <svg
      className="w-5 h-5 mr-2 text-black"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2M15 13l-3 3m0 0l-3-3m3 3V8"
      />
    </svg>
    Items Pesanan
  </h3>
  <div className="space-y-4">
    {cartItems.map((item) => {
      let itemOptions = {};
      try {
        itemOptions = item.product_options ? JSON.parse(item.product_options) : {};
      } catch (error) {
        itemOptions = {};
      }
      const selectedSize = itemOptions.Ukuran || itemOptions.size;
      const selectedColor = itemOptions.Warna || itemOptions.color || item.product?.colors;

      return (
        <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-300">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-gray-900">{item.product?.name}</h4>
            <span className="text-lg font-bold text-black">
              {formatPrice(item.unit_price * item.quantity)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              Qty: {item.quantity}
            </span>
            {selectedSize && (
              <span className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded-full">
                Size: {selectedSize}
              </span>
            )}
            {selectedColor && (
              <span className="text-sm bg-gray-300 text-gray-900 px-3 py-1 rounded-full">
                Color: {selectedColor}
              </span>
            )}
          </div>
        </div>
      );
    })}
  </div>
</div>


            {/* Notes */}
            {formData.notes && (
                <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Catatan Pesanan</h3>
                    <p className="text-gray-600">{formData.notes}</p>
                </div>
            )}

            {/* Payment Info */}
            <div className="bg-blue-100 border border-blue-300 rounded-xl p-6">
                <div className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h4 className="text-blue-900 font-semibold mb-2">Informasi Pembayaran</h4>
                        <p className="text-blue-800 text-sm">
                            Setelah konfirmasi pesanan, Anda akan diarahkan ke halaman pembayaran Midtrans yang aman. 
                            Anda dapat memilih berbagai metode pembayaran seperti transfer bank, e-wallet (GoPay, OVO, Dana), 
                            atau kartu kredit/debit.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (cartLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat keranjang Anda...</p>
                </div>
            </div>
        );
    }

    if (!cartLoading && cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center bg-white p-12 rounded-2xl shadow-lg max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Keranjang Anda Kosong</h2>
                    <p className="text-gray-600 mb-8">Silakan isi keranjang belanja Anda terlebih dahulu sebelum melanjutkan ke checkout.</p>
                    <Link 
                        to="/shop" 
                        className="inline-flex items-center bg-red-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Toko
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-600 mt-2">Selesaikan pesanan Anda dengan pembayaran online yang aman</p>
                </div>

                {/* Step Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center w-full max-w-md">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                        currentStep >= step 
                                            ? 'bg-red-600 text-white shadow-lg' 
                                            : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {currentStep > step ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            step
                                        )}
                                    </div>
                                    {step < 3 && (
                                        <div className={`flex-1 h-1 mx-3 rounded transition-all duration-300 ${
                                            currentStep > step ? 'bg-red-600' : 'bg-gray-200'
                                        }`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-center mt-4">
                        <div className="flex justify-between w-full max-w-md text-sm font-medium">
                            <span className={currentStep >= 1 ? 'text-red-600' : 'text-gray-500'}>Pengiriman</span>
                            <span className={currentStep >= 2 ? 'text-red-600' : 'text-gray-500'}>Pembayaran</span>
                            <span className={currentStep >= 3 ? 'text-red-600' : 'text-gray-500'}>Konfirmasi</span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {errors.general && (
                    <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-xl">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.general}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmitOrder}>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                {currentStep === 1 && (
                                    <ShippingForm 
                                        formData={formData} 
                                        handleInputChange={handleInputChange} 
                                        onShippingCostUpdate={handleShippingOptionsUpdate}
                                    />
                                )}
                                {currentStep === 2 && (
                                    <PaymentForm 
                                        formData={formData} 
                                        handleInputChange={handleInputChange} 
                                        paymentMethods={[{ 
                                            id: 'midtrans', 
                                            name: 'Pembayaran Online via Midtrans', 
                                            icon: '💳', 
                                            description: 'Transfer Bank, E-Wallet, Kartu Kredit/Debit' 
                                        }]}
                                        errors={errors}
                                    />
                                )}
                                {currentStep === 3 && <ConfirmationStep />}

                                {/* Navigation */}
                                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                                    <button 
                                        type="button" 
                                        onClick={handlePrevStep} 
                                        disabled={currentStep === 1}
                                        className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                                    >
                                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Kembali
                                    </button>
                                    
                                    {currentStep < 3 ? (
                                        <button 
                                            type="button" 
                                            onClick={handleNextStep}
                                            className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                        >
                                            Lanjutkan
                                            <svg className="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:bg-blue-400 disabled:transform-none shadow-lg hover:shadow-xl"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline mr-2"></div>
                                                    Memproses Pembayaran...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                    Bayar Sekarang
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <OrderSummary
                                cartItems={cartItems}
                                subtotal={subtotal}
                                shippingCost={shippingCost}
                                tax={tax}
                                total={total}
                                formatCurrency={formatPrice}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Checkout;