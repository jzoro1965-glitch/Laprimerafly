<?php
// OrderItem.php 
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_sku', // Ditambahkan
        'quantity',
        'unit_price',
        'total_price', // Ditambahkan
        'product_options', // Ditambahkan jika Anda menyimpan opsi produk (misal: ukuran, warna)
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'product_options' => 'array', // Cast product_options sebagai array jika disimpan sebagai JSON
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}