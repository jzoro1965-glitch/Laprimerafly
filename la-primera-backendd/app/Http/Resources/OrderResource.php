<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'created_at' => $this->created_at,
            'status' => $this->status,
            'subtotal' => (float) $this->subtotal,
            'tax_amount' => (float) ($this->tax_amount ?? 0),
            'shipping_amount' => (float) $this->shipping_amount,
            'discount_amount' => (float) $this->discount_amount,
            'total_amount' => (float) $this->total_amount,
            'currency' => $this->currency,
            'tracking_number' => $this->tracking_number,
            'shipped_at' => $this->shipped_at,
            'delivered_at' => $this->delivered_at,
            'notes' => $this->notes,
            
            // FIXED: Payment related fields - added snap_token
            'payment_method' => $this->payment_method ?? null,
            'snap_token' => $this->snap_token ?? null,           // CRITICAL: Include snap_token
            'payment_status' => $this->payment_status ?? null,
            'payment_reference' => $this->payment_reference ?? null,
            'payment_method_detail' => $this->payment_method_detail ?? null,
            'paid_at' => $this->paid_at,

            // Customer/User Details
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone ?? null,
            ],

            // Shipping Address Details
            'shipping_first_name' => $this->shipping_first_name,
            'shipping_last_name' => $this->shipping_last_name,
            'shipping_company' => $this->shipping_company,
            'shipping_address_line_1' => $this->shipping_address_line_1,
            'shipping_address_line_2' => $this->shipping_address_line_2,
            'shipping_city' => $this->shipping_city,
            'shipping_state' => $this->shipping_state,
            'shipping_postal_code' => $this->shipping_postal_code,
            'shipping_country' => $this->shipping_country,
            'shipping_phone' => $this->shipping_phone,

            // Billing Address Details
            'billing_first_name' => $this->billing_first_name,
            'billing_last_name' => $this->billing_last_name,
            'billing_company' => $this->billing_company,
            'billing_address_line_1' => $this->billing_address_line_1,
            'billing_address_line_2' => $this->billing_address_line_2,
            'billing_city' => $this->billing_city,
            'billing_state' => $this->billing_state,
            'billing_postal_code' => $this->billing_postal_code,
            'billing_country' => $this->billing_country,
            'billing_phone' => $this->billing_phone,

            'order_items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
        ];
    }
}