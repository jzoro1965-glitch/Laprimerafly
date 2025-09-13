<?php
// app/Models/Product.php 
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * Updated to include size_variants
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'sku',
        'price',
        'min_stock_level',
        'track_stock',
        'is_active',
        'is_featured',
        'is_digital',
        'brand',
        'colors',   // Simple string for colors
        // Removed 'sizes' and 'stock_quantity' - now handled by size_variants relationship
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_digital' => 'boolean',
        'track_stock' => 'boolean',
        'price' => 'decimal:2',
        'rating_average' => 'decimal:2',
    ];

    /**
     * The categories that belong to the product.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'product_categories');
    }

    /**
     * Get the product images for the product.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    /**
     * Get the size variants for the product.
     */
    public function sizeVariants(): HasMany
    {
        return $this->hasMany(ProductSizeVariant::class);
    }

    /**
     * Get the reviews for the product.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the order items for the product.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the cart items for the product.
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get the wishlists that contain the product.
     */
    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * Get available sizes array from size variants
     * 
     * @return array
     */
    public function getAvailableSizes(): array
    {
        return $this->sizeVariants()->pluck('size')->toArray();
    }

    /**
     * Get available colors as simple string
     * 
     * @return string
     */
    public function getAvailableColors(): string
    {
        return $this->colors ?? '';
    }

    /**
     * Check if product has specific size with stock
     * 
     * @param string $size
     * @return bool
     */
    public function hasSize(string $size): bool
    {
        return $this->sizeVariants()
            ->where('size', $size)
            ->where('stock_quantity', '>', 0)
            ->exists();
    }

    /**
     * Get stock quantity for specific size
     * 
     * @param string $size
     * @return int
     */
    public function getStockForSize(string $size): int
    {
        $variant = $this->sizeVariants()
            ->where('size', $size)
            ->first();
            
        return $variant ? $variant->stock_quantity : 0;
    }

    /**
     * Get total stock across all size variants
     * 
     * @return int
     */
    public function getTotalStock(): int
    {
        return $this->sizeVariants()->sum('stock_quantity');
    }
}