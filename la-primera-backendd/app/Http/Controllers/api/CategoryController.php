<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * Menampilkan daftar semua kategori yang aktif.
     */
    public function index()
    {
        // Menggunakan cache untuk performa, data di-cache selama 60 menit
        $categories = Cache::remember('all_active_categories', 60 * 60, function () {
            return Category::where('is_active', true)->orderBy('name')->get();
        });

        return CategoryResource::collection($categories);
    }
}