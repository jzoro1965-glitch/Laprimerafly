<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;    // Import model Order
use App\Models\User;     // Import model User
use App\Models\Product;  // Import model Product (jika ingin menambah statistik total produk)
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // Import untuk logging error

class AdminDashboardController extends Controller
{
    /**
     * Get various statistics for the admin dashboard.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats(Request $request)
    {
        try {
            // Menghitung Total Orders (semua status)
            $totalOrders = Order::count();

            // Menghitung Total Sales (jumlah total_amount dari order yang sudah delivered, completed, atau shipped)
            // Anda bisa menyesuaikan status yang dianggap "terjual" sesuai definisi bisnis Anda
            $totalSales = Order::whereIn('status', ['delivered', 'completed', 'shipped'])
                               ->sum('total_amount');

            // Menghitung Total Users (hanya user dengan role 'user')
            $totalUsers = User::where('role', 'user')->count();

            // Opsional: Contoh menambahkan statistik lain (misal: total produk)
            // $totalProducts = Product::count(); 

            return response()->json([
                'success' => true,
                'data' => [
                    'total_orders' => $totalOrders,
                    'total_sales' => $totalSales,
                    'total_users' => $totalUsers,
                    // 'total_products' => $totalProducts, // Jika Anda menambahkan ini
                ]
            ], 200);

        } catch (\Exception $e) {
            // Penting: Log error ini agar bisa dilacak di storage/logs/laravel.log
            Log::error('Error fetching dashboard stats: ' . $e->getMessage()); 
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics due to a server error. Please check server logs.'
            ], 500);
        }
    }
}