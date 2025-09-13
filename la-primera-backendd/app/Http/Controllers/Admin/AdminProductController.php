<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSizeVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class AdminProductController extends Controller
{
    /**
     * Display a listing of the products (for admin).
     * Filter, search, and paginate.
     */
    public function index(Request $request)
    {
        $products = Product::query();

        // Implement filtering and searching here
        if ($request->has('search')) {
            $search = $request->get('search');
            $products->where(function($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id') && $request->get('category_id') !== 'all') {
            $products->whereHas('categories', function ($query) use ($request) {
                $query->where('category_id', $request->get('category_id'));
            });
        }
        
        if ($request->has('status') && $request->get('status') !== 'all') {
            $status = $request->get('status');
            if ($status === 'active') $products->where('is_active', 1);
            if ($status === 'inactive') $products->where('is_active', 0);
            if ($status === 'featured') $products->where('is_featured', 1);
        }

        $products = $products->with('images', 'categories', 'sizeVariants')->latest()->paginate(10);

        return ProductResource::collection($products);
    }

    /**
     * Store a newly created product in storage.
     * Updated to handle size variants
     */
    public function store(Request $request)
    {
        try {
            // Updated validation to handle size variants
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'required|string|unique:products,slug|max:255',
                'description' => 'nullable|string',
                'short_description' => 'nullable|string|max:500',
                'sku' => 'required|string|unique:products,sku|max:255',
                'price' => 'required|numeric|min:0',
                'brand' => 'nullable|string|max:255',
                'category_ids' => 'nullable|array', 
                'category_ids.*' => 'exists:categories,id',
                'images' => 'nullable|array', 
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'colors' => 'nullable|string|max:255',
                'size_variants' => 'required|array|min:1',
                'size_variants.*.size' => 'required|string|in:M,L,S',
                'size_variants.*.stock_quantity' => 'required|integer|min:0',
            ]);

            // Validate that at least one size variant has stock > 0
            $hasStock = collect($validatedData['size_variants'])
                ->some(fn($variant) => $variant['stock_quantity'] > 0);
                
            if (!$hasStock) {
                return response()->json([
                    'errors' => ['size_variants' => ['At least one size variant must have stock greater than 0.']]
                ], 422);
            }

            // Set default values for required fields
            $productData = collect($validatedData)->except(['category_ids', 'images', 'size_variants'])->toArray();
            
            // Add default values for required fields
            $productData['is_active'] = true;
            $productData['is_featured'] = false;
            $productData['is_digital'] = false;
            $productData['track_stock'] = true;
            $productData['min_stock_level'] = 0;

            $product = DB::transaction(function () use ($productData, $validatedData) {
                $product = Product::create($productData);

                // Sync categories
                if (isset($validatedData['category_ids'])) {
                    $product->categories()->sync($validatedData['category_ids']);
                }

                // Create size variants
                foreach ($validatedData['size_variants'] as $variantData) {
                    if ($variantData['stock_quantity'] > 0) { // Only create variants with stock
                        $product->sizeVariants()->create([
                            'size' => $variantData['size'],
                            'stock_quantity' => $variantData['stock_quantity'],
                        ]);
                    }
                }

                // Handle image uploads
                if (isset($validatedData['images'])) {
                    foreach ($validatedData['images'] as $index => $imageFile) {
                        $path = $imageFile->store('products', 'public'); 
                        $product->images()->create([
                            'image_path' => $path,
                            'alt_text' => $product->name . ' Image ' . ($index + 1),
                            'sort_order' => $index,
                            'is_primary' => $index === 0,
                        ]);
                    }
                }
                
                return $product;
            });
            
            return response()->json([
                'message' => 'Product created successfully', 
                'data' => new ProductResource($product->load('images', 'categories', 'sizeVariants'))
            ], 201);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Product creation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Product creation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product)
    {
        return new ProductResource($product->load('images', 'categories', 'sizeVariants'));
    }

    /**
     * Update the specified product in storage.
     * Updated to handle size variants
     */
    public function update(Request $request, Product $product)
    {
        try {
            // Updated validation for update
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'required|string|unique:products,slug,' . $product->id . '|max:255',
                'description' => 'nullable|string',
                'short_description' => 'nullable|string|max:500',
                'sku' => 'required|string|unique:products,sku,' . $product->id . '|max:255',
                'price' => 'required|numeric|min:0',
                'brand' => 'nullable|string|max:255',
                'category_ids' => 'nullable|array',
                'category_ids.*' => 'exists:categories,id',
                'new_images' => 'nullable|array', 
                'new_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'existing_image_ids_to_delete' => 'nullable|array', 
                'existing_image_ids_to_delete.*' => 'exists:product_images,id',
                'existing_image_primary_id' => 'nullable|exists:product_images,id',
                'colors' => 'nullable|string|max:255',
                'size_variants' => 'required|array|min:1',
                'size_variants.*.size' => 'required|string|in:M,L,S',
                'size_variants.*.stock_quantity' => 'required|integer|min:0',
            ]);

            // Validate that at least one size variant has stock > 0
            $hasStock = collect($validatedData['size_variants'])
                ->some(fn($variant) => $variant['stock_quantity'] > 0);
                
            if (!$hasStock) {
                return response()->json([
                    'errors' => ['size_variants' => ['At least one size variant must have stock greater than 0.']]
                ], 422);
            }

            DB::transaction(function () use ($validatedData, $product) {
                // Update product with only the allowed fields
                $updateData = collect($validatedData)->except([
                    'category_ids', 
                    'new_images', 
                    'existing_image_ids_to_delete',
                    'existing_image_primary_id',
                    'size_variants'
                ])->toArray();
                
                $product->update($updateData);

                // Sync categories
                if (isset($validatedData['category_ids'])) {
                    $product->categories()->sync($validatedData['category_ids']);
                } else {
                    $product->categories()->detach(); 
                }

                // Update size variants
                // Delete existing variants
                $product->sizeVariants()->delete();
                
                // Create new variants
                foreach ($validatedData['size_variants'] as $variantData) {
                    if ($variantData['stock_quantity'] > 0) { // Only create variants with stock
                        $product->sizeVariants()->create([
                            'size' => $variantData['size'],
                            'stock_quantity' => $variantData['stock_quantity'],
                        ]);
                    }
                }

                // Handle deletion of existing images
                if (isset($validatedData['existing_image_ids_to_delete'])) {
                    foreach ($validatedData['existing_image_ids_to_delete'] as $imageId) {
                        $image = $product->images()->find($imageId);
                        if ($image) {
                            Storage::disk('public')->delete($image->image_path);
                            $image->delete();
                        }
                    }
                }

                // Handle new image uploads
                if (isset($validatedData['new_images'])) {
                    foreach ($validatedData['new_images'] as $index => $imageFile) {
                        $path = $imageFile->store('products', 'public');
                        $product->images()->create([
                            'image_path' => $path,
                            'alt_text' => $product->name . ' Image New ' . ($index + 1),
                            'sort_order' => $product->images()->count() + $index,
                            'is_primary' => false, 
                        ]);
                    }
                }

                // Handle setting primary image
                if (isset($validatedData['existing_image_primary_id'])) {
                    $product->images()->update(['is_primary' => false]);
                    ProductImage::where('id', $validatedData['existing_image_primary_id'])
                                 ->where('product_id', $product->id)
                                 ->update(['is_primary' => true]);
                } else {
                    // Ensure at least one image is primary if none specified
                    if ($product->images()->count() > 0 && !$product->images()->where('is_primary', true)->exists()) {
                        $product->images()->orderBy('sort_order')->first()->update(['is_primary' => true]);
                    }
                }
            });

            return response()->json([
                'message' => 'Product updated successfully', 
                'data' => new ProductResource($product->load('images', 'categories', 'sizeVariants'))
            ], 200);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Product update failed: ' . $e->getMessage());
            return response()->json(['message' => 'Product update failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product)
    {
        try {
            DB::transaction(function () use ($product) {
                // Delete size variants
                $product->sizeVariants()->delete();
                
                // Delete images
                foreach ($product->images as $image) {
                    Storage::disk('public')->delete($image->image_path);
                    $image->delete();
                }
                
                // Detach categories
                $product->categories()->detach();
                
                // Delete product
                $product->delete();
            });
            
            return response()->json(['message' => 'Product deleted successfully'], 200);
        } catch (\Exception $e) {
            \Log::error('Product deletion failed: ' . $e->getMessage());
            return response()->json(['message' => 'Product deletion failed: ' . $e->getMessage()], 500);
        }
    }
}