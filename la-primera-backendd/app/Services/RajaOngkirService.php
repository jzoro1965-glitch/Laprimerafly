<?php
// app/Services/RajaOngkirService.php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RajaOngkirService
{
    private $baseUrl;
    private $apiKey;
    
    public function __construct()
    {
        $this->baseUrl = config('rajaongkir.base_url', 'https://api.rajaongkir.com/starter');
        $this->apiKey = config('rajaongkir.api_key');
    }

    /**
     * Get list of provinces
     */
    public function getProvinces()
    {
        $cacheKey = 'rajaongkir_provinces';
        
        return Cache::remember($cacheKey, now()->addHours(24), function () {
            try {
                $response = Http::withHeaders([
                    'key' => $this->apiKey
                ])->get($this->baseUrl . '/province');

                if ($response->successful()) {
                    $data = $response->json();
                    if ($data['rajaongkir']['status']['code'] == 200) {
                        return [
                            'success' => true,
                            'data' => $data['rajaongkir']['results']
                        ];
                    }
                }

                return ['success' => false, 'message' => 'Failed to fetch provinces'];
            } catch (\Exception $e) {
                Log::error('RajaOngkir Province Error: ' . $e->getMessage());
                return ['success' => false, 'message' => 'Service unavailable'];
            }
        });
    }

    /**
     * Get cities by province ID
     */
    public function getCities($provinceId)
    {
        $cacheKey = "rajaongkir_cities_{$provinceId}";
        
        return Cache::remember($cacheKey, now()->addHours(24), function () use ($provinceId) {
            try {
                $response = Http::withHeaders([
                    'key' => $this->apiKey
                ])->get($this->baseUrl . '/city', [
                    'province' => $provinceId
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    if ($data['rajaongkir']['status']['code'] == 200) {
                        return [
                            'success' => true,
                            'data' => $data['rajaongkir']['results']
                        ];
                    }
                }

                return ['success' => false, 'message' => 'Failed to fetch cities'];
            } catch (\Exception $e) {
                Log::error('RajaOngkir Cities Error: ' . $e->getMessage());
                return ['success' => false, 'message' => 'Service unavailable'];
            }
        });
    }

    /**
     * Calculate shipping cost
     */
    public function calculateCost($origin, $destination, $weight, $courier = 'jne')
    {
        try {
            $response = Http::withHeaders([
                'key' => $this->apiKey,
                'content-type' => 'application/x-www-form-urlencoded'
            ])->asForm()->post($this->baseUrl . '/cost', [
                'origin' => $origin,
                'destination' => $destination,
                'weight' => $weight,
                'courier' => $courier
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if ($data['rajaongkir']['status']['code'] == 200) {
                    return [
                        'success' => true,
                        'data' => $data['rajaongkir']['results']
                    ];
                }
            }

            return ['success' => false, 'message' => 'Failed to calculate cost'];
        } catch (\Exception $e) {
            Log::error('RajaOngkir Cost Error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Service unavailable'];
        }
    }

    /**
     * Get multiple courier costs at once
     */
    public function getMultipleCourierCosts($origin, $destination, $weight)
    {
        $couriers = ['jne', 'pos', 'tiki'];
        $results = [];

        foreach ($couriers as $courier) {
            $cost = $this->calculateCost($origin, $destination, $weight, $courier);
            if ($cost['success']) {
                $results[$courier] = $cost['data'];
            }
        }

        return [
            'success' => !empty($results),
            'data' => $results
        ];
    }
}