// src/components/checkout/PaymentForm.jsx - Updated for Midtrans Only
function PaymentForm({ formData, handleInputChange, paymentMethods, errors }) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informasi Pembayaran
            </h2>

            {/* Payment Method Section - Since only Midtrans, show as info card */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Metode Pembayaran
                </h3>
                
                {/* Single Payment Method Card */}
                <div className="border-2 border-blue-300 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-2xl">💳</span>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">Pembayaran Online via Midtrans</h4>
                            <p className="text-sm text-gray-600">Gateway pembayaran terpercaya & aman</p>
                        </div>
                        <div className="ml-auto">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    {/* Payment Options */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="flex items-center justify-center p-2 bg-white rounded-lg border">
                            <span className="text-xs font-medium text-gray-600">Transfer Bank</span>
                        </div>
                        <div className="flex items-center justify-center p-2 bg-white rounded-lg border">
                            <span className="text-xs font-medium text-gray-600">GoPay</span>
                        </div>
                        <div className="flex items-center justify-center p-2 bg-white rounded-lg border">
                            <span className="text-xs font-medium text-gray-600">OVO</span>
                        </div>
                        <div className="flex items-center justify-center p-2 bg-white rounded-lg border">
                            <span className="text-xs font-medium text-gray-600">Dana</span>
                        </div>
                        <div className="flex items-center justify-center p-2 bg-white rounded-lg border">
                            <span className="text-xs font-medium text-gray-600">ShopeePay</span>
                        </div>
                        <div className="flex items-center justify-center p-2 bg-white rounded-lg border">
                            <span className="text-xs font-medium text-gray-600">Kartu Kredit</span>
                        </div>
                        <div className="flex items-center justify-center p-2 bg-white rounded-lg border">
                            <span className="text-xs font-medium text-gray-600">Kartu Debit</span>
                        </div>
                        <div className="flex items-center justify-center p-2 bg-white rounded-lg border">
                            <span className="text-xs font-medium text-gray-600">& Lainnya</span>
                        </div>
                    </div>
                    
                    {/* Security Features */}
                    <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Transaksi dijamin aman dengan enkripsi SSL 256-bit</span>
                    </div>
                </div>

                {/* Hidden input to maintain form compatibility */}
                <input 
                    type="hidden" 
                    name="paymentMethod" 
                    value="midtrans" 
                />
            </div>

            {/* Payment Process Information */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Cara Pembayaran
                </h3>
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                                1
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Konfirmasi Pesanan</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Klik "Bayar Sekarang" untuk melanjutkan ke halaman pembayaran
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                                2
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Pilih Metode Pembayaran</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Di halaman Midtrans, pilih metode pembayaran yang Anda inginkan
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                                3
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Selesaikan Pembayaran</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Ikuti instruksi pembayaran sesuai metode yang dipilih
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                                ✓
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Pesanan Dikonfirmasi</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Anda akan menerima konfirmasi pesanan via email dan SMS
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Important Notes */}
            <div className="mb-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <h4 className="text-yellow-900 font-medium mb-2">Penting untuk Diperhatikan:</h4>
                            <ul className="text-sm text-yellow-800 space-y-1">
                                <li>• Selesaikan pembayaran dalam waktu yang ditentukan untuk menghindari pembatalan otomatis</li>
                                <li>• Simpan nomor referensi transaksi untuk keperluan konfirmasi</li>
                                <li>• Jika mengalami kesulitan, hubungi customer service kami</li>
                                <li>• Pastikan saldo atau limit kartu mencukupi sebelum melakukan pembayaran</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Notes */}
            <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Pesanan (Opsional)
                </label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Tambahkan catatan khusus untuk pesanan Anda, seperti instruksi pengiriman atau permintaan khusus..."
                />
                <p className="text-xs text-gray-500 mt-2">
                    Catatan ini akan membantu kami memproses pesanan Anda dengan lebih baik
                </p>
            </div>
        </div>
    );
}

export default PaymentForm;