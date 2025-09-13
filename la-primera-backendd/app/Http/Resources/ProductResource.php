<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * Updated to include size variants
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Decode attributes JSON to PHP array, default to empty array if null
        $attributes = $this->attributes ? json_decode($this->attributes, true) : [];
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'compare_price' => (float) $this->compare_price,
            'cost_price' => (float) $this->cost_price,
            
            // Remove individual stock_quantity - now handled by size variants
            'min_stock_level' => (int) $this->min_stock_level,
            'track_stock' => (bool) $this->track_stock,
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'is_digital' => (bool) $this->is_digital,
            'weight' => (float) $this->weight,
            'dimensions' => $this->dimensions,
            'brand' => $this->brand,
            'attributes' => $attributes, // Additional attributes from JSON
            
            // Colors as simple string (not from attributes JSON)
            'colors' => $this->colors ?? '',
            
            // Size variants with stock per size
            'size_variants' => ProductSizeVariantResource::collection($this->whenLoaded('sizeVariants')),
            
            // Helper: total stock across all variants
            'total_stock' => $this->whenLoaded('sizeVariants', function() {
                return $this->sizeVariants->sum('stock_quantity');
            }),
            
            // Helper: available sizes array
            'available_sizes' => $this->whenLoaded('sizeVariants', function() {
                return $this->sizeVariants->where('stock_quantity', '>', 0)->pluck('size')->toArray();
            }),
            
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'views_count' => (int) $this->views_count,
            'sales_count' => (int) $this->sales_count,
            'rating_average' => (float) $this->rating_average,
            'rating_count' => (int) $this->rating_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Load categories only if eager loaded
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),

            // Load images only if eager loaded
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
        ];
    }
}