<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource; // Pastikan ini di-import
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Untuk transaksi di destroy method
use Illuminate\Support\Facades\Storage; // Untuk menghandle file gambar
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminCategoryController extends Controller
{
    /**
     * Display a listing of the categories (for admin).
     */
    public function index(Request $request)
    {
        $categoriesQuery = Category::query();

        // Load relasi parentCategory, products_count, dan children_count
        // Ini penting agar data relasi tersedia di CategoryResource
        $categoriesQuery->with('parentCategory') // Untuk mendapatkan data parent
                        ->withCount('products')  // Menghitung jumlah produk terkait
                        ->withCount('children'); // Menghitung jumlah sub-kategori

        // Logika filtering berdasarkan search query
        if ($request->has('search')) {
            $search = $request->get('search');
            $categoriesQuery->where(function($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Logika filtering berdasarkan status aktif
        if ($request->has('is_active') && $request->get('is_active') !== 'all') {
            $categoriesQuery->where('is_active', (bool)$request->get('is_active'));
        }

        // --- PENANGANAN UNTUK PERMINTAAN TANPA PAGINASI (Untuk dropdown parent category) ---
        if ($request->boolean('no_pagination')) { // Gunakan helper boolean() Laravel 11
            $allCategories = $categoriesQuery->orderBy('name')->get(); // Ambil semua data tanpa paginasi
            return CategoryResource::collection($allCategories); // Kembalikan koleksi resource tanpa meta/links paginasi
        }

        // --- DEFAULT: Kembalikan hasil paginasi ---
        $categories = $categoriesQuery->latest()->paginate(10); // Urutkan berdasarkan created_at terbaru

        return CategoryResource::collection($categories); // Kembalikan koleksi resource dengan meta/links paginasi
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'required|string|unique:categories,slug|max:255',
                'description' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Untuk gambar kategori
                'icon' => 'nullable|string|max:255', // Untuk class icon atau path
                'parent_id' => 'nullable|exists:categories,id', // Harus ada di tabel categories
                'sort_order' => 'integer|min:0',
                'is_active' => 'boolean',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string',
            ]);

            // Handle image upload
            if ($request->hasFile('image')) {
                $validatedData['image'] = $request->file('image')->store('categories', 'public');
            }

            $category = Category::create($validatedData);

            // Load parentCategory untuk response, jika ada
            return response()->json(['message' => 'Category created successfully', 'data' => new CategoryResource($category->load('parentCategory'))], 201);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Category creation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Category creation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category)
    {
        // Load relasi parentCategory, products_count, dan children_count saat menampilkan kategori tunggal
        $category->load('parentCategory')->loadCount(['products', 'children']);
        return new CategoryResource($category);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
                'description' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // New image upload
                'icon' => 'nullable|string|max:255',
                'parent_id' => ['nullable', 'exists:categories,id', Rule::notIn([$category->id])], // Mencegah self-parenting
                'sort_order' => 'integer|min:0',
                'is_active' => 'boolean',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string',
            ]);

            // Handle image update/deletion
            if ($request->hasFile('image')) {
                // Hapus gambar lama jika ada
                if ($category->image) {
                    Storage::disk('public')->delete($category->image);
                }
                $validatedData['image'] = $request->file('image')->store('categories', 'public');
            } else if ($request->boolean('clear_image')) { // Jika frontend mengirim flag untuk menghapus gambar
                if ($category->image) {
                    Storage::disk('public')->delete($category->image);
                }
                $validatedData['image'] = null; // Set gambar ke null di database
            } else {
                // Pertahankan gambar yang sudah ada jika tidak ada file baru diupload dan tidak diminta untuk dihapus
                unset($validatedData['image']);
            }

            $category->update($validatedData);

            // Load parentCategory untuk response, jika ada
            return response()->json(['message' => 'Category updated successfully', 'data' => new CategoryResource($category->load('parentCategory'))], 200);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Category update failed: ' . $e->getMessage());
            return response()->json(['message' => 'Category update failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category)
    {
        try {
            DB::transaction(function () use ($category) {
                // Hapus gambar jika ada
                if ($category->image) {
                    Storage::disk('public')->delete($category->image);
                }

                // Hapus relasi dengan produk di tabel pivot (product_categories)
                $category->products()->detach(); 

                // Detach anak-anak kategori jika ada (jadikan mereka kategori root)
                // Atau, Anda bisa memilih untuk menghapus semua anak juga (hati-hati!)
                Category::where('parent_id', $category->id)->update(['parent_id' => null]); 

                $category->delete();
            });
            return response()->json(['message' => 'Category deleted successfully'], 200);
        } catch (\Exception $e) {
            \Log::error('Category deletion failed: ' . $e->getMessage());
            return response()->json(['message' => 'Category deletion failed: ' . $e->getMessage()], 500);
        }
    }
}