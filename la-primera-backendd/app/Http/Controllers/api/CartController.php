<?php
// CartController.php - FIXED VERSION
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    /**
     * Helper function to get authenticated user or return error response.
     */
    protected function getAuthenticatedUser(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized. Please login.'], 401);
        }
        return $user;
    }

    /**
     * Menampilkan isi keranjang belanja user yang sedang login.
     */
    public function index(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        $cart = Cart::with([
            'cartItems.product.images',
            'cartItems.product.sizeVariants'
        ])->firstOrCreate(['user_id' => $user->id]);
        
        return response()->json(['data' => $cart->cartItems], 200);
    }

    /**
     * FIXED: Helper function to extract size from product_options
     */
    private function extractSelectedSize($productOptions)
    {
        if (empty($productOptions)) {
            return null;
        }

        // Case 1: Array of objects format from frontend: [{"name": "Ukuran", "value": "L"}]
        if (is_array($productOptions) && !empty($productOptions)) {
            // Check if it's an array of objects
            $firstItem = reset($productOptions);
            if (is_array($firstItem) && isset($firstItem['name']) && isset($firstItem['value'])) {
                foreach ($productOptions as $option) {
                    if (isset($option['name']) && isset($option['value'])) {
                        $optionName = strtolower(trim($option['name']));
                        if (in_array($optionName, ['ukuran', 'size', 'sizes'])) {
                            return trim($option['value']);
                        }
                    }
                }
            }
            // Case 2: Direct object format: {"Ukuran": "L", "size": "M"}
            else {
                $keys = ['Ukuran', 'ukuran', 'Size', 'size', 'sizes'];
                foreach ($keys as $key) {
                    if (isset($productOptions[$key]) && !empty($productOptions[$key])) {
                        return trim($productOptions[$key]);
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * FIXED: Menambahkan produk ke keranjang dengan validasi stok yang benar
     */
    public function store(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1',
                'product_options' => 'nullable'
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
        
        $product = Product::with('sizeVariants')->findOrFail($request->product_id); 

        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id],
            [
                'total_amount' => 0.00,
                'total_items' => 0,
                'total_qty' => 0,
                'total_price' => 0.00,
                'grand_total' => 0.00
            ]
        );
        
        // FIXED: Normalize product_options
        $productOptions = $request->product_options ?? [];
        
        if (is_string($productOptions)) {
            try {
                $productOptions = json_decode($productOptions, true) ?? [];
            } catch (\Exception $e) {
                $productOptions = [];
            }
        } elseif (!is_array($productOptions)) {
            $productOptions = [];
        }
        
        $productOptionsJson = json_encode($productOptions);
        
        // FIXED: Extract selected size using helper function
        $selectedSize = $this->extractSelectedSize($productOptions);
        
        // Debug logging
        \Log::info('Adding to cart - Debug Info', [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'user_id' => $user->id,
            'raw_product_options' => $request->product_options,
            'normalized_product_options' => $productOptions,
            'extracted_size' => $selectedSize,
            'available_size_variants' => $product->sizeVariants->pluck('size', 'stock_quantity')->toArray()
        ]);
        
        // Check for existing cart item with same product AND options
        $cartItem = $cart->cartItems()
            ->where('product_id', $product->id)
            ->where('product_options', $productOptionsJson)
            ->first();

        // FIXED: Improved stock validation
        if ($product->track_stock) {
            $availableStock = 0;
            
            // If product has size variants, validate against size-specific stock
            if ($product->sizeVariants->count() > 0) {
                if (!$selectedSize) {
                    return response()->json([
                        'success' => false,
                        'message' => "Harap pilih ukuran untuk produk '{$product->name}'."
                    ], 400);
                }
                
                $sizeVariant = $product->sizeVariants->where('size', $selectedSize)->first();
                if (!$sizeVariant) {
                    return response()->json([
                        'success' => false,
                        'message' => "Ukuran '{$selectedSize}' tidak tersedia untuk produk '{$product->name}'."
                    ], 400);
                }
                
                $availableStock = $sizeVariant->stock_quantity;
                
                \Log::info('Stock validation for size variant', [
                    'product' => $product->name,
                    'selected_size' => $selectedSize,
                    'size_variant_found' => $sizeVariant ? 'yes' : 'no',
                    'available_stock' => $availableStock
                ]);
            } else {
                // Use global product stock if no size variants
                $availableStock = $product->stock_quantity ?? 0;
            }
            
            $requestedQuantity = $request->quantity;
            if ($cartItem) {
                $requestedQuantity += $cartItem->quantity;
            }
            
            if ($availableStock < $requestedQuantity) {
                $sizeInfo = $selectedSize ? " ukuran '{$selectedSize}'" : "";
                return response()->json([
                    'success' => false,
                    'message' => "Stok tidak mencukupi untuk produk '{$product->name}'{$sizeInfo}. Tersedia: {$availableStock}, Total diminta: {$requestedQuantity}"
                ], 400);
            }
        }

        if ($cartItem) {
            // Update existing cart item
            $cartItem->increment('quantity', $request->quantity);
            $cartItem->update(['total_price' => $cartItem->unit_price * $cartItem->quantity]);
        } else {
            // Create new cart item
            $cartItem = $cart->cartItems()->create([
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'unit_price' => $product->price,
                'total_price' => $product->price * $request->quantity,
                'product_options' => $productOptionsJson
            ]);
        }
        
        $cart->recalculateTotals();
        
        $cartItem->load(['product.images', 'product.sizeVariants']);

        return response()->json([
            'success' => true, 
            'message' => 'Produk berhasil ditambahkan ke keranjang.', 
            'data' => $cartItem
        ], 201);
    }

    /**
     * Memperbarui kuantitas item spesifik di keranjang.
     */
    public function update(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        try {
            $request->validate([
                'quantity' => 'required|integer|min:1'
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }

        $cartItem = CartItem::with(['cart', 'product.images', 'product.sizeVariants'])->find($id);
        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found.'], 404);
        }

        if ($cartItem->cart->user_id !== $user->id) { 
            return response()->json(['message' => 'Forbidden. You do not own this cart item.'], 403);
        }

        // FIXED: Add stock validation for updates too
        $product = $cartItem->product;
        if ($product->track_stock) {
            $productOptions = json_decode($cartItem->product_options, true) ?? [];
            $selectedSize = $this->extractSelectedSize($productOptions);
            
            $availableStock = 0;
            if ($product->sizeVariants->count() > 0 && $selectedSize) {
                $sizeVariant = $product->sizeVariants->where('size', $selectedSize)->first();
                $availableStock = $sizeVariant ? $sizeVariant->stock_quantity : 0;
            } else {
                $availableStock = $product->stock_quantity ?? 0;
            }
            
            if ($request->quantity > $availableStock) {
                $sizeInfo = $selectedSize ? " ukuran '{$selectedSize}'" : "";
                return response()->json([
                    'success' => false,
                    'message' => "Stok tidak mencukupi untuk produk '{$product->name}'{$sizeInfo}. Tersedia: {$availableStock}, Diminta: {$request->quantity}"
                ], 400);
            }
        }

        $cartItem->update([
            'quantity' => $request->quantity,
            'total_price' => $cartItem->unit_price * $request->quantity 
        ]);

        $cartItem->cart->recalculateTotals();

        return response()->json([
            'success' => true, 
            'message' => 'Kuantitas produk di keranjang berhasil diperbarui.',
            'data' => $cartItem
        ], 200);
    }

    /**
     * Menghapus satu item dari keranjang belanja.
     */
    public function destroy(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        $cartItem = CartItem::with('cart')->find($id);
        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found.'], 404);
        }

        if ($cartItem->cart->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden. You do not own this cart item.'], 403);
        }

        $cart = $cartItem->cart; 
        $cartItem->delete();
        
        $cart->recalculateTotals();

        return response()->json(['success' => true, 'message' => 'Item berhasil dihapus dari keranjang.'], 200);
    }

    /**
     * Mengosongkan seluruh keranjang belanja user yang sedang login.
     */
    public function clear(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json(['message' => 'Keranjang tidak ditemukan untuk user ini.'], 404);
        }

        $cart->cartItems()->delete(); 
        $cart->update([
            'total_amount' => 0.00,
            'total_items' => 0,
            'total_qty' => 0,
            'total_price' => 0.00,
            'grand_total' => 0.00
        ]);

        return response()->json(['success' => true, 'message' => 'Keranjang berhasil dikosongkan.'], 200);
    }
}