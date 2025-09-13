<?php
// app/Models/ProductSizeVariant.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSizeVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'size',
        'stock_quantity',
    ];

    protected $casts = [
        'stock_quantity' => 'integer',
    ];

    /**
     * Get the product that owns the size variant.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Check if this size variant is in stock
     */
    public function isInStock(): bool
    {
        return $this->stock_quantity > 0;
    }

    /**
     * Check if this size variant is low stock
     */
    public function isLowStock(int $threshold = 5): bool
    {
        return $this->stock_quantity > 0 && $this->stock_quantity <= $threshold;
    }
}