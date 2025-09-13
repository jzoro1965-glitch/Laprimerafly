<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Menampilkan semua item di wishlist pengguna yang sedang login.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $wishlistProducts = $user->wishlist()->with('categories')->get();

        return ProductResource::collection($wishlistProducts);
    }

    /**
     * Menambahkan produk ke wishlist.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = $request->user();
        
        // syncWithoutDetaching akan menambah jika belum ada, dan tidak akan membuat duplikat.
        $user->wishlist()->syncWithoutDetaching($request->product_id);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil ditambahkan ke wishlist.'
        ]);
    }

    /**
     * Menghapus produk dari wishlist.
     * Menggunakan route model binding untuk Product.
     */
    public function destroy(Request $request, Product $product)
    {
        $user = $request->user();
        
        // detach akan menghapus relasi dari tabel pivot.
        if ($user->wishlist()->detach($product->id)) {
            return response()->json([
                'success' => true,
                'message' => 'Produk berhasil dihapus dari wishlist.'
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Produk tidak ditemukan di wishlist.'
        ], 404);
    }
}