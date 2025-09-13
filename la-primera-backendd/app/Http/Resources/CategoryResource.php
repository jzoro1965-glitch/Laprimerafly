<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage; // Untuk generate URL gambar

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            // Menggunakan Storage::url untuk gambar yang disimpan di disk 'public'
            'image' => $this->image ? Storage::url($this->image) : null,
            'icon' => $this->icon,
            'parent_id' => $this->parent_id,
            // Muat 'parent_category' resource hanya jika relasi dimuat (eager loaded)
            // Menggunakan new CategoryResource($this->whenLoaded('parentCategory'))
            // Ini mencegah N+1 query problem dan rekursi tak terbatas.
            'parent_category' => $this->whenLoaded('parentCategory', function () {
                // Untuk menghindari rekursi tak terbatas jika ada nested child,
                // kita bisa memilih properti yang minimalis untuk parent,
                // atau membuat resource terpisah untuk parent jika strukturnya kompleks.
                // Untuk kasus sederhana, cukup ambil id dan name.
                // Jika ingin full resource, gunakan: new CategoryResource($this->parentCategory)
                return [
                    'id' => $this->parentCategory->id,
                    'name' => $this->parentCategory->name,
                    'slug' => $this->parentCategory->slug,
                    // Bisa tambahkan properti lain yang relevan dari parent
                ];
            }),
            'sort_order' => $this->sort_order,
            'is_active' => (bool) $this->is_active, // Pastikan ini boolean untuk frontend
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            // Sertakan counts hanya jika relasi dihitung (withCount)
            'products_count' => $this->when(isset($this->products_count), $this->products_count),
            'children_count' => $this->when(isset($this->children_count), $this->children_count),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}