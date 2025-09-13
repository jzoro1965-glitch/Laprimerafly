// app/Http/Controllers/Api/MidtransCallbackController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Midtrans\Notification;
use Midtrans\Config;

class MidtransCallbackController extends Controller
{
    public function handle(Request $request)
    {
        // 1. Set konfigurasi Midtrans
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');

        // 2. Verifikasi Signature Key untuk memastikan notifikasi valid
        try {
            $notification = new Notification();
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create Midtrans Notification instance: ' . $e->getMessage(),
            ], 500);
        }

        $transactionStatus = $notification->transaction_status;
        $orderId = $notification->order_id;
        $fraudStatus = $notification->fraud_status;

        // 3. Cari pesanan berdasarkan order_id
        $order = Order::where('order_number', $orderId)->first();
        
        if (!$order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        // 4. Hindari pemrosesan ulang untuk status yang sudah final
        if (in_array($order->status, ['delivered', 'shipped', 'cancelled', 'refunded'])) {
            return response()->json(['message' => 'Order already in a final state.']);
        }
        
        try {
            // 5. Jalankan logika update dalam transaksi database
            DB::transaction(function () use ($transactionStatus, $fraudStatus, $order) {
                if ($transactionStatus === 'capture') {
                    // Hanya untuk pembayaran kartu kredit.
                    if ($fraudStatus === 'challenge') {
                        $order->update(['status' => 'pending']);
                    } else if ($fraudStatus === 'accept') {
                        $order->update(['status' => 'processing']);
                        $this->updateStockAndSales($order);
                    }
                } else if ($transactionStatus === 'settlement') {
                    // Pembayaran sukses (e-wallet, bank transfer, dll.)
                    $order->update(['status' => 'processing']);
                    $this->updateStockAndSales($order);
                } else if ($transactionStatus === 'pending') {
                    $order->update(['status' => 'pending']);
                } else if (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
                    // Pembayaran gagal atau dibatalkan
                    $order->update(['status' => 'cancelled']);
                }
            });

            return response()->json(['message' => 'Callback processed successfully.']);

        } catch (\Exception $e) {
            Log::error('Midtrans Callback Error: ' . $e->getMessage(), [
                'order_id' => $orderId,
                'request_payload' => $request->all()
            ]);
            return response()->json(['message' => 'Internal server error.'], 500);
        }
    }

    private function updateStockAndSales(Order $order)
    {
        // Pastikan logika ini hanya dijalankan sekali
        if ($order->status !== 'processing') {
            return;
        }

        foreach ($order->orderItems as $orderItem) {
            $product = $orderItem->product;
            if ($product && $product->track_stock) {
                // Kurangi stok produk
                $product->decrement('stock_quantity', $orderItem->quantity);
                // Tingkatkan sales count
                $product->increment('sales_count', $orderItem->quantity);
            }
        }
        
        // Kosongkan keranjang user setelah pembayaran berhasil
        $userCart = $order->user->cart()->first();
        if ($userCart) {
            $userCart->cartItems()->delete();
            $userCart->recalculateTotals();
        }
    }
}