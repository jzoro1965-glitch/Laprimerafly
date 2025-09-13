<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WishlistController;

// Import semua Controller Admin Anda
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminDashboardController;

// Import RajaOngkir Controller
use App\Http\Controllers\RajaOngkirController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rute untuk Tes Koneksi (Publik)
Route::get('/', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'API La-Primera Berhasil Terkoneksi!',
        'version' => 'Laravel 11',
        'timestamp' => now()
    ]);
});

// --- RAJAONGKIR ROUTES (PUBLIK) - PERBAIKAN UTAMA ---
Route::prefix('rajaongkir')->name('rajaongkir.')->group(function () {
    // Test connection route
    Route::get('test', [RajaOngkirController::class, 'testConnection'])->name('test');
    
    // Location routes
    Route::get('provinces', [RajaOngkirController::class, 'getProvinces'])->name('provinces');
    Route::get('cities/{provinceId}', [RajaOngkirController::class, 'getCities'])->name('cities');
    Route::get('districts/{cityId}', [RajaOngkirController::class, 'getDistricts'])->name('districts');
    
    // Cost calculation route
    Route::post('calculate-cost', [RajaOngkirController::class, 'calculateCost'])->name('calculate-cost');
});

// --- Rute Publik (Tidak Perlu Login) ---
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('password.email');
Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('password.update');

Route::get('categories', [CategoryController::class, 'index']);
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{id}', [ProductController::class, 'show'])->where('id', '[0-9]+|[a-zA-Z0-9\-]+');

// Rute untuk notifikasi Midtrans (Publik)
// Route::post('/midtrans/callback', [MidtransCallbackController::class, 'handle']);

// --- Rute Terproteksi (Wajib Login untuk Semua User) ---
Route::middleware('auth:sanctum')->group(function () {
    // Rute Autentikasi User
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'profile']);
    
    // Rute Manajemen User (User Biasa Mengubah Profilnya Sendiri)
    Route::put('user/profile', [UserController::class, 'updateProfile']);
    Route::put('user/password', [UserController::class, 'updatePassword']);
    Route::post('user/avatar', [UserController::class, 'updateAvatar']);

    // Rute Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{product}', [WishlistController::class, 'destroy']);
    
    // Rute Cart (Keranjang Belanja)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::patch('/cart/items/{id}', [CartController::class, 'update']);
    Route::delete('/cart/items/{id}', [CartController::class, 'destroy']);
    Route::post('/cart/clear', [CartController::class, 'clear']);

    // Rute Pesanan (User Biasa Membuat/Melihat Pesanannya)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::patch('/orders/{order}/cancel', [OrderController::class, 'cancel']); 
    Route::delete('/orders/{order}', [OrderController::class, 'destroy']);

    // --- Rute Terproteksi Khusus Admin ---
    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
        // Dashboard statistics
        Route::get('dashboard-stats', [AdminDashboardController::class, 'getStats']);

        // Manajemen Produk oleh Admin
        Route::apiResource('products', AdminProductController::class);

        // Manajemen Pesanan oleh Admin
        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::get('orders/{order}', [AdminOrderController::class, 'show']);
        Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
        Route::delete('orders/{order}', [AdminOrderController::class, 'destroy']);

        // Manajemen User oleh Admin
        Route::apiResource('users', AdminUserController::class);

        // Manajemen Kategori oleh Admin
        Route::apiResource('categories', AdminCategoryController::class);
    });
});