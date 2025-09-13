<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product; // Untuk update stok saat pembatalan
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AdminOrderController extends Controller
{
    /**
     * Display a listing of the orders (for admin).
     * Filter, search, and paginate.
     */
    public function index(Request $request)
    {
        $orders = Order::query();

        // Implement filtering, searching, sorting for admin
        if ($request->has('search')) {
            $search = $request->get('search');
            $orders->where(function($query) use ($search) {
                $query->where('order_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                      })
                      ->orWhereHas('orderItems', function ($q) use ($search) {
                          $q->where('product_name', 'like', "%{$search}%")
                            ->orWhere('product_sku', 'like', "%{$search}%");
                      });
            });
        }

        if ($request->has('status') && $request->get('status') !== 'all') {
            $orders->where('status', $request->get('status'));
        }

        if ($request->has('min_total')) {
            $orders->where('total_amount', '>=', $request->get('min_total'));
        }
        if ($request->has('max_total')) {
            $orders->where('total_amount', '<=', $request->get('max_total'));
        }

        // Add more filters (e.g., date range, total amount range)

        $orders = $orders->with('user', 'orderItems.product.images')->latest()->paginate(10);

        return OrderResource::collection($orders);
    }

    /**
     * Display the specified order (for admin).
     */
    public function show(Order $order)
    {
        return new OrderResource($order->load('user', 'orderItems.product.images'));
    }

    /**
     * Update the status of the specified order (by admin).
     */
    public function updateStatus(Request $request, Order $order)
    {
        try {
            $validatedData = $request->validate([
                'status' => 'required|in:pending,processing,shipped,delivered,cancelled,refunded',
                'tracking_number' => 'nullable|string|max:255', // Admin bisa update tracking number
            ]);

            $oldStatus = $order->status;
            $newStatus = $validatedData['status'];

            DB::transaction(function () use ($order, $oldStatus, $newStatus, $validatedData) {
                $order->update(['status' => $newStatus]);

                // Logika bisnis berdasarkan perubahan status:
                // Mengembalikan stok jika dibatalkan dari status non-cancelled/refunded
                if ($newStatus === 'cancelled' && !in_array($oldStatus, ['cancelled', 'refunded'])) {
                    foreach ($order->orderItems as $orderItem) {
                        $product = $orderItem->product;
                        if ($product && $product->track_stock) {
                            $product->increment('stock_quantity', $orderItem->quantity);
                        }
                    }
                }
                // Mengurangi stok jika status berubah ke 'processing' atau 'shipped' dari 'cancelled'
                // (Ini opsional, stok biasanya sudah dikurangi saat order dibuat)
                else if (in_array($newStatus, ['processing', 'shipped']) && $oldStatus === 'cancelled') {
                    foreach ($order->orderItems as $orderItem) {
                        $product = $orderItem->product;
                        if ($product && $product->track_stock && $product->stock_quantity >= $orderItem->quantity) {
                            $product->decrement('stock_quantity', $orderItem->quantity);
                        } else {
                            // Handle insufficient stock if trying to reactivate a cancelled order
                            throw new \Exception("Insufficient stock to reactivate order " . $order->order_number . " for product " . $product->name);
                        }
                    }
                }

                // Jika statusnya delivered, catat waktu delivered_at
                if ($newStatus === 'delivered' && $order->delivered_at === null) {
                    $order->update(['delivered_at' => now()]);
                } else if ($newStatus !== 'delivered') { // Jika status diubah dari delivered ke yang lain, reset delivered_at
                    $order->update(['delivered_at' => null]);
                }

                // Jika statusnya shipped, catat waktu shipped_at dan tambahkan tracking number
                if ($newStatus === 'shipped' && $order->shipped_at === null) {
                    $order->update([
                        'shipped_at' => now(), 
                        'tracking_number' => $validatedData['tracking_number'] ?? $order->tracking_number // Update tracking_number jika dikirim
                    ]);
                } else if ($newStatus !== 'shipped') { // Jika status diubah dari shipped ke yang lain, reset shipped_at & tracking_number
                     $order->update(['shipped_at' => null, 'tracking_number' => null]);
                }

                // Jika tracking_number dikirim tapi status bukan shipped, simpan saja
                if (isset($validatedData['tracking_number']) && $newStatus !== 'shipped') {
                    $order->update(['tracking_number' => $validatedData['tracking_number']]);
                }

                // Tambahkan lebih banyak logika (misal: notifikasi email ke pelanggan)
            });

            return response()->json(['message' => 'Order status updated successfully', 'data' => new OrderResource($order->load('user', 'orderItems.product.images'))], 200);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Admin Order status update failed for order ' . $order->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Order status update failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete the specified order (for admin).
     * This is a hard delete and should be used with extreme caution.
     */
    public function destroy(Order $order)
    {
        try {
            DB::transaction(function () use ($order) {
                // Hapus semua order items yang terkait
                $order->orderItems()->delete();
                // Hapus pesanan itu sendiri
                $order->delete();
            });
            return response()->json(['message' => 'Order deleted successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Admin Order deletion failed for order ' . $order->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Order deletion failed: ' . $e->getMessage()], 500);
        }
    }
}