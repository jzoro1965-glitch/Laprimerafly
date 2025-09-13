<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage; // Tidak lagi dibutuhkan di sini jika ProductResource menangani URL gambar

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            // Perbaikan 1: Pastikan kunci nama produk sesuai ekspektasi frontend
            'product_name' => $this->product_name, 
            'product_sku' => $this->product_sku, // Tambahkan ini jika ingin mengekspos SKU
            'quantity' => (int) $this->quantity, // Pastikan casting ke integer
            'unit_price' => (float) $this->unit_price, // Pastikan casting ke float
            'total_price' => (float) $this->total_price, // Pastikan casting ke float
            'product_options' => $this->product_options, // Jika ini JSON, pastikan di-cast di model OrderItem
            
            // Perbaikan 2: Lampirkan ProductResource jika relasi 'product' sudah di-load
            // Ini akan menyediakan struktur 'item.product' yang diharapkan frontend
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}