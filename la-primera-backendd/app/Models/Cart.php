<?php
// Cart.php 
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'session_id', // Digunakan jika Anda ingin mendukung keranjang untuk user tamu (guest)
        'total_amount', // Total termasuk shipping, tax, diskon (grand_total)
        'total_items',  // Jumlah item unik dalam keranjang
        'total_qty',    // Total kuantitas semua produk dalam keranjang
        'total_price',  // Subtotal harga produk saja
        'grand_total',  // Sama dengan total_amount (biasanya)
        'expires_at',   // Untuk keranjang tamu atau sesi yang kedaluwarsa
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expires_at'   => 'datetime',
        'total_amount' => 'decimal:2',
        'total_price'  => 'decimal:2',
        'grand_total'  => 'decimal:2',
    ];

    /**
     * Get the user that owns the cart.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the cart items for the cart.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Recalculate the totals for the cart based on its items.
     * Ini harus dipanggil setiap kali item keranjang ditambahkan, diperbarui, atau dihapus.
     */
    public function recalculateTotals(): void
    {
        $subtotal = $this->cartItems->sum(function ($item) {
            return $item->unit_price * $item->quantity;
        });

        $totalQty = $this->cartItems->sum('quantity');
        $totalItems = $this->cartItems->count(); // Jumlah item unik

        // Anda bisa menambahkan logika untuk diskon, pajak, shipping di sini
        // Misalnya:
        // $discountAmount = $this->applyDiscounts($subtotal);
        // $taxAmount = ($subtotal - $discountAmount) * 0.11; // 11% PPN
        // $shippingCost = $this->calculateShippingCost(); // Logic untuk biaya pengiriman

        // Untuk saat ini, kita akan menjaga agar tetap sederhana sesuai struktur Anda:
        $this->total_price = $subtotal; // Subtotal produk
        $this->total_amount = $subtotal; // Asumsi grand_total sama dengan subtotal jika belum ada shipping/tax/discount
        $this->grand_total = $subtotal; // Juga asumsikan sama dengan subtotal
        $this->total_qty = $totalQty;
        $this->total_items = $totalItems;

        $this->save();
    }
}