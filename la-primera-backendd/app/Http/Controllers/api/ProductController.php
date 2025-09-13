<?php
// ProductController.php 
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Menampilkan daftar produk dengan filter dan paginasi.
     */
    public function index(Request $request)
    {
        // 1. Mulai query dengan eager loading untuk efisiensi (menghindari N+1 problem)
        $query = Product::with('categories')->where('is_active', true);

        // 2. Algoritma Filter berdasarkan slug kategori
        if ($request->filled('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // 3. Algoritma Pencarian
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('sku', 'like', "%{$searchTerm}%");
            });
        }

        // 4. Algoritma Sorting
        $sortBy = $request->input('sort_by', 'created_at'); // Default sort
        $sortOrder = $request->input('sort_order', 'desc'); // Default order
        if (in_array($sortBy, ['name', 'price', 'created_at'])) {
             $query->orderBy($sortBy, $sortOrder);
        }

        // 5. Ambil produk dengan paginasi (12 produk per halaman)
        $products = $query->paginate(12);

        return ProductResource::collection($products);
    }

    /**
     * Menampilkan detail satu produk.
     */
    // public function show(string $id)
    // {
    //     // Cari produk berdasarkan ID atau slug
    //     $product = Product::with('categories')
    //         ->where('is_active', true)
    //         ->where(function ($query) use ($id) {
    //             $query->where('id', $id)
    //                   ->orWhere('slug', $id);
    //         })
    //         ->firstOrFail();

    //     return new ProductResource($product);
    // }
    public function show(string $id)
{
    $product = Product::with(['categories', 'images', 'sizeVariants']) // <- Tambahkan ini
        ->where('is_active', true)
        ->where(function ($query) use ($id) {
            $query->where('id', $id)
                  ->orWhere('slug', $id);
        })
        ->firstOrFail();

    return new ProductResource($product);
}
}