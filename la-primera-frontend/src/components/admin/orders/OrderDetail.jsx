// src/pages/admin/orders/OrderDetail.jsx - UPDATED WITH RAJAONGKIR INTEGRATION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../utils/api';
import { formatPrice } from '../../../components/shop/utils/Formatters';

function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateErrors, setUpdateErrors] = useState({});

    const statusOptions = [
        'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-purple-100 text-purple-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper function to extract product options (size, etc.)
    const extractProductOptions = (productOptions) => {
        if (!productOptions) return {};
        
        try {
            let parsed = {};
            
            if (typeof productOptions === 'string') {
                parsed = JSON.parse(productOptions);
            } else if (typeof productOptions === 'object') {
                parsed = productOptions;
            }
            
            // Handle both array and object formats
            if (Array.isArray(parsed)) {
                // Convert array format [{"name": "Ukuran", "value": "L"}] to object format
                return parsed.reduce((acc, option) => {
                    if (option.name && option.value) {
                        acc[option.name] = option.value;
                    }
                    return acc;
                }, {});
            } else if (typeof parsed === 'object' && parsed !== null) {
                // Use object format directly
                return parsed;
            }
            
            return {};
        } catch (error) {
            console.error('Error parsing product options:', error);
            return {};
        }
    };

    // Helper function to get size from product options
    const getSelectedSize = (productOptions) => {
        const options = extractProductOptions(productOptions);
        return options.Ukuran || options.ukuran || options.Size || options.size || null;
    };

    // Helper function to get color - now checks both product options AND product.colors
    const getSelectedColor = (productOptions, productData) => {
        // First check if color was selected as an option during purchase
        const options = extractProductOptions(productOptions);
        
        // Check various possible color field names in options
        const colorKeys = [
            'Warna', 'warna', 'Color', 'color', 'colors', 'Colors',
            'colour', 'Colour', 'WARNA', 'COLOR'
        ];
        
        for (const key of colorKeys) {
            if (options[key] && options[key] !== '') {
                return options[key];
            }
        }
        
        // If no color in options, check product.colors field
        if (productData && productData.colors && productData.colors.trim() !== '') {
            return productData.colors.trim();
        }
        
        return null;
    };

    // Helper function to get all available colors from product
    const getProductColors = (productData) => {
        if (productData && productData.colors && productData.colors.trim() !== '') {
            return productData.colors.trim();
        }
        return null;
    };

    // NEW: Helper function to parse shipping address data
    const parseShippingAddress = (order) => {
        // Extract province, city, district information
        // These could be stored as IDs or names depending on your implementation
        const province = order.shipping_province || order.shipping_state || 'N/A';
        const city = order.shipping_city || 'N/A';
        const district = order.shipping_district || order.shipping_state || 'N/A';
        
        return {
            province,
            city,
            district
        };
    };

    // NEW: Helper function to parse shipping method information
    const parseShippingMethod = (order) => {
        // Check if shipping method info is stored in notes or separate fields
        let shippingInfo = {
            courier: 'N/A',
            service: 'N/A',
            cost: order.shipping_amount || 0,
            etd: 'N/A'
        };

        // Try to extract from order notes if structured
        if (order.notes) {
            try {
                const notesData = JSON.parse(order.notes);
                if (notesData.shipping_method) {
                    shippingInfo = {
                        courier: notesData.shipping_method.courier || 'N/A',
                        service: notesData.shipping_method.service || 'N/A',
                        cost: notesData.shipping_method.cost || order.shipping_amount || 0,
                        etd: notesData.shipping_method.etd || 'N/A'
                    };
                }
            } catch (e) {
                // Notes is not JSON, check if it contains shipping info as text
                if (order.notes.includes('JNE') || order.notes.includes('POS') || order.notes.includes('TIKI')) {
                    const courierMatch = order.notes.match(/(JNE|POS|TIKI)/i);
                    if (courierMatch) {
                        shippingInfo.courier = courierMatch[1];
                    }
                }
            }
        }

        // Check if there are dedicated shipping method fields
        if (order.shipping_method_courier) {
            shippingInfo.courier = order.shipping_method_courier;
        }
        if (order.shipping_method_service) {
            shippingInfo.service = order.shipping_method_service;
        }
        if (order.shipping_method_etd) {
            shippingInfo.etd = order.shipping_method_etd;
        }

        return shippingInfo;
    };

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await adminAPI.getOrder(id);
                setOrder(response.data);
                setNewStatus(response.data.status);
                setTrackingNumber(response.data.tracking_number || '');
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError(err.message || "Failed to fetch order details.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateErrors({});
        try {
            const payload = { 
                status: newStatus,
                tracking_number: trackingNumber || null
            };
            const response = await adminAPI.updateOrderStatus(id, payload);
            if (response.success) {
                alert('Order status updated successfully!');
                setOrder(response.data);
            } else {
                alert(response.message || 'Failed to update order status.');
            }
        } catch (err) {
            console.error("Error updating order status:", err);
            if (err.response && err.response.data && err.response.data.errors) {
                setUpdateErrors(err.response.data.errors);
            } else {
                setUpdateErrors({ general: err.message || "An unexpected error occurred." });
            }
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) return <p className="text-center">Loading order details...</p>;
    if (error) return <p className="text-red-500 text-center">Error: {error}</p>;
    if (!order) return <p className="text-center">Order not found.</p>;

    // Parse shipping information
    const shippingAddress = parseShippingAddress(order);
    const shippingMethod = parseShippingMethod(order);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Order #{order.order_number}</h1>
            
            {updateErrors.general && <div className="mb-4 text-red-600">{updateErrors.general}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Summary */}
                <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                    <p className="mb-2"><span className="font-medium">Order Date:</span> {new Date(order.created_at).toLocaleString()}</p>
                    <p className="mb-2"><span className="font-medium">Current Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span></p>
                    <p className="mb-2"><span className="font-medium">Total Amount:</span> {formatPrice(order.total_amount)}</p>
                    <p className="mb-2"><span className="font-medium">Payment Method:</span> {order.payment_method || 'N/A'}</p>
                    <p className="mb-2"><span className="font-medium">Tracking Number:</span> {order.tracking_number || 'N/A'}</p>
                    {order.shipped_at && <p className="mb-2"><span className="font-medium">Shipped At:</span> {new Date(order.shipped_at).toLocaleString()}</p>}
                    {order.delivered_at && <p className="mb-2"><span className="font-medium">Delivered At:</span> {new Date(order.delivered_at).toLocaleString()}</p>}
                    <p className="mb-2"><span className="font-medium">Notes:</span> {order.notes || 'No notes'}</p>
                </div>

                {/* Customer Details */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Details</h2>
                    <p className="mb-2"><span className="font-medium">Name:</span> {order.user?.name || 'N/A'}</p>
                    <p className="mb-2"><span className="font-medium">Email:</span> {order.user?.email || 'N/A'}</p>
                    <p className="mb-2"><span className="font-medium">Phone:</span> {order.user?.phone || 'N/A'}</p>
                </div>

                {/* UPDATED: Shipping Address with RajaOngkir Integration */}
                <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Shipping Address
                    </h2>
                    <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {order.shipping_first_name} {order.shipping_last_name}</p>
                        <p><span className="font-medium">Address:</span> {order.shipping_address_line_1}</p>
                        {order.shipping_address_line_2 && <p><span className="font-medium">Address 2:</span> {order.shipping_address_line_2}</p>}
                        
                        {/* NEW: Display Province, City, District from RajaOngkir */}
                        <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-sm font-medium text-gray-600 mb-1">Location Details:</p>
                            <p className="text-sm"><span className="font-medium">Province:</span> {shippingAddress.province}</p>
                            <p className="text-sm"><span className="font-medium">City/Regency:</span> {shippingAddress.city}</p>
                            <p className="text-sm"><span className="font-medium">District:</span> {shippingAddress.district}</p>
                            <p className="text-sm"><span className="font-medium">Postal Code:</span> {order.shipping_postal_code}</p>
                        </div>
                        
                        <p><span className="font-medium">Country:</span> {order.shipping_country}</p>
                        <p><span className="font-medium">Phone:</span> {order.shipping_phone}</p>
                    </div>
                </div>

                {/* Billing Address */}
                <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Billing Address</h2>
                    <p>{order.billing_first_name} {order.billing_last_name}</p>
                    <p>{order.billing_address_line_1}</p>
                    {order.billing_address_line_2 && <p>{order.billing_address_line_2}</p>}
                    <p>{order.billing_city}, {order.billing_state} {order.billing_postal_code}</p>
                    <p>{order.billing_country}</p>
                    <p>Phone: {order.billing_phone}</p>
                </div>

                {/* NEW: Shipping Method & Cost Information */}
                <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Shipping Information
                    </h2>
                    <div className="space-y-2">
                        <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-sm font-medium text-gray-600 mb-2">Shipping Method:</p>
                            <div className="space-y-1">
                                <p className="text-sm">
                                    <span className="font-medium">Courier:</span> 
                                    <span className="ml-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        {shippingMethod.courier}
                                    </span>
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Service:</span> 
                                    <span className="ml-2">{shippingMethod.service}</span>
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Cost:</span> 
                                    <span className="ml-2 font-bold text-green-600">{formatPrice(shippingMethod.cost)}</span>
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Estimated Delivery:</span> 
                                    <span className="ml-2">{shippingMethod.etd}</span>
                                </p>
                            </div>
                        </div>
                        
                        {order.tracking_number && (
                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                <p className="text-sm font-medium text-yellow-800">Tracking Information:</p>
                                <p className="text-sm text-yellow-700 font-mono">{order.tracking_number}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Items - with Color Display */}
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Order Items</h2>
            <div className="overflow-x-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Product</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">SKU</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Size/Color</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Qty</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Unit Price</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(order.order_items ?? []).map(item => {
                            const selectedSize = getSelectedSize(item.product_options);
                            const selectedColor = getSelectedColor(item.product_options, item.product);
                            const productColors = getProductColors(item.product);
                            const allOptions = extractProductOptions(item.product_options);
                            
                            return (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        <div className="flex items-center">
                                            <img 
                                                src={item.product?.images?.[0]?.image_path || '/images/placeholder.webp'} 
                                                alt={item.product_name} 
                                                className="w-12 h-12 object-cover rounded-md mr-3 border border-gray-200" 
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                                {productColors && (
                                                    <p className="text-xs text-gray-500">
                                                        Available Colors: {productColors}
                                                    </p>
                                                )}
                                                {Object.entries(allOptions).map(([key, value]) => {
                                                    if (!['Ukuran', 'ukuran', 'Size', 'size', 'Warna', 'warna', 'Color', 'color'].includes(key)) {
                                                        return (
                                                            <p key={key} className="text-xs text-gray-500">
                                                                {key}: {value}
                                                            </p>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{item.product_sku}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        <div className="space-y-1">
                                            {selectedSize && (
                                                <div className="flex items-center">
                                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                                        Size: {selectedSize}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {selectedColor && (
                                                <div className="flex items-center">
                                                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                                        Color: {selectedColor}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {!selectedColor && productColors && (
                                                <div className="flex items-center">
                                                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                                                        Colors: {productColors}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {!selectedSize && !selectedColor && !productColors && (
                                                <span className="text-xs text-gray-400">N/A</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700 text-center font-medium">{item.quantity}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700 font-medium">{formatPrice(item.unit_price)}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700 font-bold">{formatPrice(item.total_price)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Order Totals Summary */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>{formatPrice(order.subtotal || order.total_amount)}</span>
                        </div>
                        {order.shipping_amount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>Shipping ({shippingMethod.courier} {shippingMethod.service}):</span>
                                <span>{formatPrice(order.shipping_amount)}</span>
                            </div>
                        )}
                        {order.tax_amount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>Tax:</span>
                                <span>{formatPrice(order.tax_amount)}</span>
                            </div>
                        )}
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount:</span>
                                <span>-{formatPrice(order.discount_amount)}</span>
                            </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Total:</span>
                            <span>{formatPrice(order.total_amount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Status Form */}
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Update Order Status</h2>
            <form onSubmit={handleStatusUpdate} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                    <select
                        id="status"
                        name="status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        {statusOptions.map(status => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                    </select>
                    {updateErrors.status && <p className="mt-1 text-sm text-red-600">{updateErrors.status[0]}</p>}
                </div>
                 <div>
                    <label htmlFor="tracking_number" className="block text-sm font-medium text-gray-700 mb-1">Tracking Number (Optional)</label>
                    <input
                        type="text"
                        id="tracking_number"
                        name="tracking_number"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Enter tracking number"
                    />
                    {updateErrors.tracking_number && <p className="mt-1 text-sm text-red-600">{updateErrors.tracking_number[0]}</p>}
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={updateLoading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 disabled:bg-blue-400"
                    >
                        {updateLoading ? 'Updating...' : 'Update Status'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default OrderDetail;