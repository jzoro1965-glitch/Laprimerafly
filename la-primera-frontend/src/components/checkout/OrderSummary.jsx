// src/components/checkout/OrderSummary.jsx
import React from 'react';
import CartItem from './CartItem';

function OrderSummary({ cartItems, subtotal, shippingCost, tax, total, formatCurrency }) {
  // Calculate some summary stats
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueProducts = cartItems.length;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 sticky top-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Ringkasan Pesanan
        </h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">{uniqueProducts} produk</p>
          <p className="text-sm text-gray-600">{totalItems} item</p>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 border-b pb-6 mb-6 max-h-96 overflow-y-auto">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Keranjang Anda kosong</p>
            <p className="text-gray-400 text-sm">Tambahkan produk untuk melanjutkan</p>
          </div>
        )}
      </div>

      {/* ENHANCED: Order Summary with Selected Variants Display */}
      {cartItems.length > 0 && (
        <>
          

          {/* Price Breakdown */}
          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-base">Subtotal ({totalItems} item):</span>
              <span className="font-semibold text-lg">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base">Biaya Pengiriman:</span>
              <span className="font-semibold text-lg">
                {shippingCost === 0 ? (
                  <span className="text-green-600">Gratis</span>
                ) : (
                  formatCurrency(shippingCost)
                )}
              </span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-base">Pajak:</span>
                <span className="font-semibold text-lg">{formatCurrency(tax)}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t pt-6 mt-6">
            <span className="text-xl font-bold text-gray-900">Total Pembayaran:</span>
            <span className="text-3xl font-bold text-red-600">
              {formatCurrency(total)}
            </span>
          </div>

          {/* Security & Guarantee Badges */}
          <div className="mt-6 space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center text-green-800">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-medium">Pembayaran Aman & Terenkripsi</span>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center text-blue-800">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h8a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span className="text-sm font-medium">Garansi Uang Kembali 30 Hari</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default OrderSummary;