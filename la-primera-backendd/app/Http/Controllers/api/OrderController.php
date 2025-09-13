<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

use Midtrans\Snap;
use Midtrans\Config;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()
                         ->orders()
                         ->with(['orderItems.product.images', 'user'])
                         ->latest()
                         ->paginate(10);
        
        return OrderResource::collection($orders);
    }

    public function show(Request $request, Order $order)
    {
        if ($request->user()->id !== $order->user_id) {
            return response()->json(['message' => 'Unauthorized. You do not own this order.'], 403);
        }
        
        return new OrderResource($order->load(['orderItems.product.images', 'user']));
    }

    public function store(Request $request)
    {
        $user = $request->user();

        // Log payload untuk debugging
        Log::info('Order creation payload:', $request->all());

        try {
            // PERBAIKAN: Update validasi untuk support RajaOngkir
            $validatedData = $request->validate([
                // Personal info (bisa dari formData langsung atau nested dalam shipping)
                'shipping.firstName' => 'required|string|max:255',
                'shipping.lastName' => 'required|string|max:255',
                'shipping.email' => 'required|email|max:255', 
                'shipping.phone' => 'required|string|max:20',
                
                // Address info - support both ID dan nama
                'shipping.address' => 'required|string|max:255',
                'shipping.provinceId' => 'nullable|string|max:10',     // ID dari RajaOngkir
                'shipping.province' => 'nullable|string|max:255',      // Nama provinsi
                'shipping.cityId' => 'nullable|string|max:10',         // ID dari RajaOngkir  
                'shipping.city' => 'nullable|string|max:255',          // Nama kota
                'shipping.districtId' => 'nullable|string|max:10',     // ID dari RajaOngkir
                'shipping.district' => 'nullable|string|max:255',      // Nama kecamatan
                'shipping.postalCode' => 'required|string|max:255',
                'shipping.country' => 'required|string|max:255',

                // Billing - bisa sama dengan shipping
                'billing.firstName' => 'required|string|max:255',
                'billing.lastName' => 'required|string|max:255',
                'billing.email' => 'required|email|max:255',
                'billing.phone' => 'required|string|max:20', 
                'billing.address' => 'required|string|max:255',
                'billing.provinceId' => 'nullable|string|max:10',
                'billing.province' => 'nullable|string|max:255',
                'billing.cityId' => 'nullable|string|max:10',
                'billing.city' => 'nullable|string|max:255', 
                'billing.districtId' => 'nullable|string|max:10',
                'billing.district' => 'nullable|string|max:255',
                'billing.postalCode' => 'required|string|max:255',
                'billing.country' => 'required|string|max:255',

                // Payment method validation - only accept midtrans
                'payment.method' => 'required|string|in:midtrans',
                
                // Shipping option dari RajaOngkir
                'shipping_option' => 'nullable|array',
                'shipping_option.id' => 'nullable|string',
                'shipping_option.courier' => 'nullable|string', 
                'shipping_option.service' => 'nullable|string',
                'shipping_option.cost' => 'nullable|numeric',
                'shipping_option.etd' => 'nullable|string',
                
                'cart_items' => 'required|array|min:1',
                'cart_items.*.product_id' => 'required|exists:products,id',
                'cart_items.*.quantity' => 'required|integer|min:1',
                'cart_items.*.unit_price' => 'required|numeric|min:0',
                'cart_items.*.product_options' => 'nullable',

                'subtotal_amount' => 'required|numeric|min:0',
                'shipping_amount' => 'required|numeric|min:0',
                'tax_amount' => 'nullable|numeric|min:0',
                'total_amount' => 'required|numeric|min:0',
                'notes' => 'nullable|string|max:1000',
            ]);
        } catch (ValidationException $e) {
            Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'payload' => $request->all()
            ]);
            return response()->json(['success' => false, 'message' => 'Validasi gagal.', 'errors' => $e->errors()], 422);
        }

        // Validasi cart items sebelum membuat order
        $validationErrors = $this->validateCartItems($validatedData['cart_items']);
        if (!empty($validationErrors)) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi produk gagal.',
                'error' => $validationErrors[0]
            ], 400);
        }

        $order = null;
        $midtransSnapToken = null;

        // Set konfigurasi Midtrans
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production', false);
        Config::$isSanitized = config('midtrans.is_sanitized', true);
        Config::$is3ds = config('midtrans.is_3ds', true);

        try {
            DB::transaction(function () use ($validatedData, $user, &$order, &$midtransSnapToken) {
                $shipping = $validatedData['shipping'];
                $billing = $validatedData['billing'];

                // PERBAIKAN: Handle data dari RajaOngkir dengan fallback
                $shippingProvince = $shipping['province'] ?? $shipping['provinceId'] ?? '';
                $shippingCity = $shipping['city'] ?? $shipping['cityId'] ?? '';
                $shippingState = $shipping['district'] ?? $shipping['districtId'] ?? $shippingProvince;
                
                $billingProvince = $billing['province'] ?? $billing['provinceId'] ?? '';  
                $billingCity = $billing['city'] ?? $billing['cityId'] ?? '';
                $billingState = $billing['district'] ?? $billing['districtId'] ?? $billingProvince;

                // Create order with midtrans payment method
                $order = Order::create([
                    'user_id' => $user->id,
                    'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                    'status' => 'pending',
                    'payment_method' => 'midtrans', // Always midtrans
                    'subtotal' => $validatedData['subtotal_amount'],
                    'tax_amount' => $validatedData['tax_amount'] ?? 0,
                    'shipping_amount' => $validatedData['shipping_amount'],
                    'discount_amount' => 0.00,
                    'total_amount' => $validatedData['total_amount'],
                    'currency' => 'IDR',
                    
                    // Shipping address - gunakan data yang ada
                    'shipping_first_name' => $shipping['firstName'],
                    'shipping_last_name' => $shipping['lastName'],
                    'shipping_address_line_1' => $shipping['address'],
                    'shipping_city' => $shippingCity,
                    'shipping_state' => $shippingState, 
                    'shipping_postal_code' => $shipping['postalCode'],
                    'shipping_country' => $shipping['country'],
                    'shipping_phone' => $shipping['phone'],
                    
                    // Billing address
                    'billing_first_name' => $billing['firstName'],
                    'billing_last_name' => $billing['lastName'], 
                    'billing_address_line_1' => $billing['address'],
                    'billing_city' => $billingCity,
                    'billing_state' => $billingState,
                    'billing_postal_code' => $billing['postalCode'],
                    'billing_country' => $billing['country'],
                    'billing_phone' => $billing['phone'],
                    
                    'notes' => $validatedData['notes'] ?? null,
                ]);

                // Process order items dan get item details for Midtrans
                $itemDetails = $this->processOrderItems($validatedData['cart_items'], $order, $user);

                // Add shipping cost to item details for Midtrans
                if ($validatedData['shipping_amount'] > 0) {
                    $shippingService = 'Biaya Pengiriman';
                    if (isset($validatedData['shipping_option'])) {
                        $shippingOption = $validatedData['shipping_option'];
                        if (isset($shippingOption['courier']) && isset($shippingOption['service'])) {
                            $shippingService = $shippingOption['courier'] . ' ' . $shippingOption['service'];
                        }
                    }
                    
                    $itemDetails[] = [
                        'id' => 'SHIPPING',
                        'price' => (int) $validatedData['shipping_amount'],
                        'quantity' => 1,
                        'name' => $shippingService,
                    ];
                }

                // Create Midtrans payload
                $midtransPayload = [
                    'transaction_details' => [
                        'order_id' => $order->order_number,
                        'gross_amount' => (int) $validatedData['total_amount'],
                    ],
                    'customer_details' => [
                        'first_name' => $shipping['firstName'],
                        'last_name' => $shipping['lastName'],
                        'email' => $shipping['email'],
                        'phone' => $shipping['phone'],
                        'billing_address' => [
                            'first_name' => $billing['firstName'],
                            'last_name' => $billing['lastName'],
                            'address' => $billing['address'],
                            'city' => $billingCity,
                            'postal_code' => $billing['postalCode'],
                            'phone' => $billing['phone'],
                            'country_code' => 'IDN',
                        ],
                        'shipping_address' => [
                            'first_name' => $shipping['firstName'],
                            'last_name' => $shipping['lastName'],
                            'address' => $shipping['address'],
                            'city' => $shippingCity,
                            'postal_code' => $shipping['postalCode'],
                            'phone' => $shipping['phone'],
                            'country_code' => 'IDN',
                        ],
                    ],
                    'item_details' => $itemDetails,
                    // Add custom expiry time (24 hours)
                    'custom_expiry' => [
                        'order_time' => date('Y-m-d H:i:s O'),
                        'expiry_duration' => 1440, // 24 hours in minutes
                        'unit' => 'minute'
                    ],
                    // Add callbacks
                    'callbacks' => [
                        'finish' => url('/orders/payment/finish'),
                        'unfinish' => url('/orders/payment/unfinish'),
                        'error' => url('/orders/payment/error'),
                    ]
                ];

                try {
                    $midtransSnapToken = Snap::getSnapToken($midtransPayload);
                    $order->update(['snap_token' => $midtransSnapToken]);
                    
                    Log::info('Midtrans snap token generated successfully', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'snap_token' => substr($midtransSnapToken, 0, 20) . '...',
                        'total_amount' => $validatedData['total_amount']
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to generate Midtrans snap token', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'error' => $e->getMessage(),
                        'payload' => $midtransPayload
                    ]);
                    throw new \Exception('Gagal membuat token pembayaran Midtrans: ' . $e->getMessage());
                }
            });

            $order->load(['orderItems.product.images', 'user']);
            
            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat. Silakan lanjutkan ke pembayaran.',
                'data' => new OrderResource($order),
                'snap_token' => $midtransSnapToken,
                'payment_type' => 'midtrans',
                'payment_url' => "https://app.midtrans.com/snap/v1/transactions/{$midtransSnapToken}/pay",
            ], 201);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Order creation failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id,
                'payload' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pesanan: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper function untuk extract size dari product options
     */
    private function extractSelectedSize($productOptions, $productName = 'product')
    {
        if (empty($productOptions)) {
            Log::info("No product options for {$productName}");
            return null;
        }

        Log::info("Extracting size from options for {$productName}", [
            'options_type' => gettype($productOptions),
            'options_content' => $productOptions
        ]);

        // Jika string, decode dulu
        if (is_string($productOptions)) {
            try {
                $productOptions = json_decode($productOptions, true);
            } catch (\Exception $e) {
                Log::error("Failed to decode product options for {$productName}", [
                    'options' => $productOptions,
                    'error' => $e->getMessage()
                ]);
                return null;
            }
        }

        if (is_array($productOptions) && !empty($productOptions)) {
            $firstItem = reset($productOptions);
            
            // Format array of objects: [{"name": "Ukuran", "value": "L"}]
            if (is_array($firstItem) && isset($firstItem['name']) && isset($firstItem['value'])) {
                foreach ($productOptions as $option) {
                    if (isset($option['name']) && isset($option['value'])) {
                        $optionName = strtolower(trim($option['name']));
                        if (in_array($optionName, ['ukuran', 'size', 'sizes'])) {
                            Log::info("Found size in array format for {$productName}: {$option['value']}");
                            return trim($option['value']);
                        }
                    }
                }
            }
            // Format object: {"Ukuran": "L", "Warna": "Red"}
            else {
                $sizeKeys = ['Ukuran', 'ukuran', 'Size', 'size', 'sizes'];
                foreach ($sizeKeys as $key) {
                    if (isset($productOptions[$key]) && !empty($productOptions[$key])) {
                        Log::info("Found size in object format for {$productName}: {$productOptions[$key]}");
                        return trim($productOptions[$key]);
                    }
                }
            }
        }
        
        Log::warning("No size found in product options for {$productName}", [
            'processed_options' => $productOptions
        ]);
        return null;
    }

    /**
     * Validasi cart items sebelum membuat order
     */
    private function validateCartItems($cartItems)
    {
        $errors = [];
        
        foreach ($cartItems as $index => $cartItem) {
            $productId = $cartItem['product_id'] ?? null;
            $quantity = $cartItem['quantity'] ?? 0;
            $productOptions = $cartItem['product_options'] ?? [];
            
            $product = Product::with('sizeVariants')->find($productId);
            if (!$product) {
                $errors[] = "Produk dengan ID {$productId} tidak ditemukan.";
                continue;
            }
            
            // Cek apakah produk membutuhkan size selection
            if ($product->sizeVariants && $product->sizeVariants->count() > 0) {
                $selectedSize = $this->extractSelectedSize($productOptions, $product->name);
                
                if (!$selectedSize) {
                    $errors[] = "Silakan pilih ukuran untuk produk '{$product->name}'.";
                    continue;
                }
                
                $sizeVariant = $product->sizeVariants->where('size', $selectedSize)->first();
                if (!$sizeVariant) {
                    $errors[] = "Ukuran '{$selectedSize}' tidak tersedia untuk produk '{$product->name}'.";
                    continue;
                }
                
                if ($product->track_stock && $sizeVariant->stock_quantity < $quantity) {
                    $errors[] = "Stok tidak mencukupi untuk produk '{$product->name}' ukuran '{$selectedSize}'. Tersedia: {$sizeVariant->stock_quantity}, Diminta: {$quantity}";
                    continue;
                }
            } else if ($product->track_stock && $product->stock_quantity < $quantity) {
                $errors[] = "Stok tidak mencukupi untuk produk '{$product->name}'. Tersedia: {$product->stock_quantity}, Diminta: {$quantity}";
            }
        }
        
        return $errors;
    }

    /**
     * Process order items dengan menggunakan helper functions
     */
    private function processOrderItems($cartItems, $order, $user)
    {
        $itemDetails = [];

        foreach ($cartItems as $item) {
            $product = Product::with('sizeVariants')->find($item['product_id']);
            if (!$product) {
                throw new \Exception("Product with ID {$item['product_id']} not found.");
            }

            // Extract selected size menggunakan helper function
            $selectedSize = $this->extractSelectedSize($item['product_options'] ?? [], $product->name);

            // Normalize product options
            $normalizedOptions = is_array($item['product_options']) ? 
                                $item['product_options'] : 
                                (is_string($item['product_options']) ? json_decode($item['product_options'], true) : []);

            // Buat OrderItem
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_sku' => $product->sku,
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total_price' => $item['unit_price'] * $item['quantity'],
                'product_options' => json_encode($normalizedOptions ?? []),
            ]);

            // Pastikan price adalah integer untuk Midtrans
            $itemDetails[] = [
                'id' => (string) $product->id,
                'price' => (int) $item['unit_price'],
                'quantity' => (int) $item['quantity'],
                'name' => $product->name,
            ];

            // Update stok
            if ($product->track_stock) {
                if ($product->sizeVariants->count() > 0 && $selectedSize) {
                    $sizeVariant = $product->sizeVariants->where('size', $selectedSize)->first();
                    if ($sizeVariant) {
                        $sizeVariant->decrement('stock_quantity', $item['quantity']);
                        Log::info('Updated size variant stock', [
                            'product' => $product->name,
                            'size' => $selectedSize,
                            'reduced_by' => $item['quantity'],
                            'new_stock' => $sizeVariant->fresh()->stock_quantity
                        ]);
                    }
                } else {
                    $product->decrement('stock_quantity', $item['quantity']);
                    Log::info('Updated global stock', [
                        'product' => $product->name,
                        'reduced_by' => $item['quantity'],
                        'new_stock' => $product->fresh()->stock_quantity
                    ]);
                }
            }
        }

        // Clear cart setelah berhasil
        $userCart = $user->cart()->first();
        if ($userCart) {
            $userCart->cartItems()->delete();
            $userCart->recalculateTotals();
        }

        return $itemDetails;
    }

    /**
     * Handle payment notification from Midtrans
     */
    public function handleMidtransNotification(Request $request)
    {
        try {
            // Set Midtrans configuration
            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = config('midtrans.is_production', false);

            $notification = new \Midtrans\Notification();
            
            $transactionStatus = $notification->transaction_status;
            $paymentType = $notification->payment_type;
            $orderId = $notification->order_id;
            $fraudStatus = $notification->fraud_status ?? null;

            Log::info('Midtrans notification received', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'payment_type' => $paymentType,
                'fraud_status' => $fraudStatus
            ]);

            $order = Order::where('order_number', $orderId)->first();
            if (!$order) {
                Log::error('Order not found for Midtrans notification', ['order_id' => $orderId]);
                return response()->json(['message' => 'Order not found'], 404);
            }

            DB::transaction(function () use ($order, $transactionStatus, $fraudStatus, $notification) {
                if ($transactionStatus == 'capture') {
                    if ($fraudStatus == 'challenge') {
                        $order->update(['status' => 'pending']);
                    } else if ($fraudStatus == 'accept') {
                        $order->update([
                            'status' => 'processing',
                            'payment_status' => 'paid',
                            'paid_at' => now()
                        ]);
                    }
                } else if ($transactionStatus == 'settlement') {
                    $order->update([
                        'status' => 'processing',
                        'payment_status' => 'paid',
                        'paid_at' => now()
                    ]);
                } else if ($transactionStatus == 'pending') {
                    $order->update(['status' => 'pending']);
                } else if ($transactionStatus == 'deny' || $transactionStatus == 'expire' || $transactionStatus == 'cancel') {
                    $order->update(['status' => 'cancelled']);
                    
                    // Restore stock when payment is cancelled/expired
                    foreach ($order->orderItems as $orderItem) {
                        $product = $orderItem->product;
                        if ($product && $product->track_stock) {
                            $productOptions = json_decode($orderItem->product_options, true) ?? [];
                            $selectedSize = $this->extractSelectedSize($productOptions, $product->name);

                            if ($product->sizeVariants->count() > 0 && $selectedSize) {
                                $sizeVariant = $product->sizeVariants->where('size', $selectedSize)->first();
                                if ($sizeVariant) {
                                    $sizeVariant->increment('stock_quantity', $orderItem->quantity);
                                }
                            } else {
                                $product->increment('stock_quantity', $orderItem->quantity);
                            }
                        }
                    }
                }

                // Update additional payment info
                $order->update([
                    'payment_reference' => $notification->transaction_id ?? null,
                    'payment_method_detail' => $notification->payment_type ?? null,
                ]);
            });

            return response()->json(['message' => 'Notification processed successfully'], 200);

        } catch (\Exception $e) {
            Log::error('Midtrans notification processing failed', [
                'error' => $e->getMessage(),
                'request_body' => $request->all()
            ]);
            return response()->json(['message' => 'Notification processing failed'], 500);
        }
    }

    public function cancel(Request $request, Order $order)
    {
        if ($request->user()->id !== $order->user_id) {
            return response()->json(['message' => 'Unauthorized. You do not own this order.'], 403);
        }

        if (!in_array($order->status, ['pending', 'processing'])) {
            return response()->json([
                'message' => 'Pesanan tidak dapat dibatalkan karena sudah dalam status ' . $order->status . '.'
            ], 400);
        }

        try {
            DB::transaction(function () use ($order) {
                $order->update(['status' => 'cancelled']);

                // Restore stock
                foreach ($order->orderItems as $orderItem) {
                    $product = $orderItem->product;
                    if ($product && $product->track_stock) {
                        $productOptions = json_decode($orderItem->product_options, true) ?? [];
                        $selectedSize = $this->extractSelectedSize($productOptions, $product->name);

                        if ($product->sizeVariants->count() > 0 && $selectedSize) {
                            $sizeVariant = $product->sizeVariants->where('size', $selectedSize)->first();
                            if ($sizeVariant) {
                                $sizeVariant->increment('stock_quantity', $orderItem->quantity);
                            }
                        } else {
                            $product->increment('stock_quantity', $orderItem->quantity);
                        }
                    }
                }
            });

            $order->load(['orderItems.product.images', 'user']);

            return response()->json([
                'success' => true, 
                'message' => 'Pesanan berhasil dibatalkan.', 
                'data' => new OrderResource($order)
            ], 200);

        } catch (\Exception $e) {
            Log::error('Order cancellation failed for order ' . $order->id . ': ' . $e->getMessage());
            return response()->json([
                'success' => false, 
                'message' => 'Gagal membatalkan pesanan. ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, Order $order)
    {
        if ($request->user()->id !== $order->user_id) {
            return response()->json(['message' => 'Unauthorized. You do not own this order.'], 403);
        }

        if ($order->status !== 'cancelled') {
            return response()->json([
                'message' => 'Pesanan hanya dapat dihapus jika statusnya "Dibatalkan".'
            ], 400);
        }
        
        try {
            DB::transaction(function () use ($order) {
                $order->orderItems()->delete();
                $order->delete();
            });

            return response()->json([
                'success' => true, 
                'message' => 'Pesanan berhasil dihapus.'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Order deletion failed for order ' . $order->id . ': ' . $e->getMessage());
            return response()->json([
                'success' => false, 
                'message' => 'Gagal menghapus pesanan. ' . $e->getMessage()
            ], 500);
        }
    }

    // Admin methods
    public function getOrderForAdmin(Request $request, $id)
    {
        try {
            $order = Order::with(['orderItems.product.images', 'user'])->find($id);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => new OrderResource($order)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch order for admin: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order details'
            ], 500);
        }
    }

    public function updateOrderStatusForAdmin(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled,refunded',
                'tracking_number' => 'nullable|string|max:255',
            ]);

            $order = Order::with(['orderItems.product.images', 'user'])->find($id);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $updateData = ['status' => $validatedData['status']];
            
            if (isset($validatedData['tracking_number'])) {
                $updateData['tracking_number'] = $validatedData['tracking_number'];
            }

            if ($validatedData['status'] === 'shipped' && $order->status !== 'shipped') {
                $updateData['shipped_at'] = now();
            }
            
            if ($validatedData['status'] === 'delivered' && $order->status !== 'delivered') {
                $updateData['delivered_at'] = now();
            }

            $order->update($updateData);
            $order->refresh();
            $order->load(['orderItems.product.images', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => new OrderResource($order)
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update order status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status'
            ], 500);
        }
    }

    public function getAllOrdersForAdmin(Request $request)
    {
        try {
            $query = Order::with(['orderItems.product.images', 'user']);
            
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }
            
            if ($request->has('date_from') && $request->date_from !== '') {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            
            if ($request->has('date_to') && $request->date_to !== '') {
                $query->whereDate('created_at', '<=', $request->date_to);
            }
            
            if ($request->has('search') && $request->search !== '') {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('order_number', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                          $userQuery->where('name', 'LIKE', "%{$searchTerm}%")
                                   ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                      });
                });
            }
            
            $orders = $query->latest()->paginate(20);
            
            return OrderResource::collection($orders);

        } catch (\Exception $e) {
            Log::error('Failed to fetch orders for admin: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders'
            ], 500);
        }
    }
}