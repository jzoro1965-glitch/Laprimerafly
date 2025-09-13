<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class RajaOngkirController extends Controller
{
    // private $rajaongkirKey = 'WbiyE5Aia8714f6125537b6aNaefsF3n';
    private $rajaongkirKey = 'o2inZIGlfc9fb029d1585a4fOXs73TLp';
    private $rajaongkirBaseUrl = 'https://rajaongkir.komerce.id/api/v1';

    /**
     * Test koneksi RajaOngkir API
     */
    public function testConnection()
    {
        try {
            Log::info('Testing RajaOngkir API connection...');
            
            $response = Http::timeout(10)->withHeaders([
                'Key' => $this->rajaongkirKey
            ])->get($this->rajaongkirBaseUrl . '/destination/province');

            $responseData = [
                'success' => $response->successful(),
                'status_code' => $response->status(),
                'api_key_used' => substr($this->rajaongkirKey, 0, 10) . '...',
                'url_called' => $this->rajaongkirBaseUrl . '/destination/province',
                'timestamp' => now(),
                'message' => $response->successful() ? 'RajaOngkir API connection successful' : 'RajaOngkir API connection failed'
            ];

            if ($response->successful()) {
                $data = $response->json();
                $responseData['total_provinces'] = count($data['data'] ?? []);
                $responseData['sample_data'] = array_slice($data['data'] ?? [], 0, 3);
            } else {
                $responseData['error_response'] = $response->body();
                $responseData['error_message'] = 'HTTP ' . $response->status();
            }

            return response()->json($responseData);
            
        } catch (Exception $e) {
            Log::error('RajaOngkir test connection error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'RajaOngkir API connection failed',
                'timestamp' => now()
            ], 500);
        }
    }

    /**
     * Get provinces
     */
    public function getProvinces()
    {
        try {
            Log::info('Fetching provinces from RajaOngkir API');
            
            $response = Http::timeout(30)->withHeaders([
                'Key' => $this->rajaongkirKey
            ])->get($this->rajaongkirBaseUrl . '/destination/province');

            Log::info('RajaOngkir provinces response status: ' . $response->status());

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['data']) && is_array($data['data'])) {
                    $provinces = collect($data['data'])->map(function ($item) {
                        return [
                            'province_id' => $item['id'],
                            'province' => $item['name']
                        ];
                    })->toArray();

                    Log::info('Provinces fetched successfully. Total: ' . count($provinces));

                    return response()->json([
                        'success' => true,
                        'data' => $provinces,
                        'total' => count($provinces)
                    ]);
                } else {
                    throw new Exception('Invalid response structure from RajaOngkir API');
                }
            } else {
                throw new Exception('Failed to fetch provinces: HTTP ' . $response->status() . ' - ' . $response->body());
            }

        } catch (Exception $e) {
            Log::error('RajaOngkir getProvinces error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data provinsi',
                'error' => $e->getMessage(),
                'timestamp' => now()
            ], 500);
        }
    }

    /**
     * Get cities by province ID
     */
    public function getCities($provinceId)
    {
        try {
            Log::info("Fetching cities for province ID: {$provinceId}");
            
            $response = Http::timeout(30)->withHeaders([
                'Key' => $this->rajaongkirKey
            ])->get($this->rajaongkirBaseUrl . '/destination/city/' . $provinceId);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['data']) && is_array($data['data'])) {
                    $cities = collect($data['data'])->map(function ($item) use ($provinceId) {
                        return [
                            'city_id' => $item['id'],
                            'city_name' => $item['name'],
                            'province_id' => $provinceId,
                            'type' => $item['type'] ?? 'Kota'
                        ];
                    })->toArray();

                    Log::info("Cities fetched successfully for province {$provinceId}. Total: " . count($cities));

                    return response()->json([
                        'success' => true,
                        'data' => $cities,
                        'total' => count($cities),
                        'province_id' => $provinceId
                    ]);
                } else {
                    throw new Exception('Invalid response structure from RajaOngkir API');
                }
            } else {
                throw new Exception('Failed to fetch cities: HTTP ' . $response->status() . ' - ' . $response->body());
            }

        } catch (Exception $e) {
            Log::error('RajaOngkir getCities error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data kota',
                'error' => $e->getMessage(),
                'province_id' => $provinceId
            ], 500);
        }
    }

    /**
     * Get districts by city ID
     */
    public function getDistricts($cityId)
    {
        try {
            Log::info("Fetching districts for city ID: {$cityId}");
            
            $response = Http::timeout(30)->withHeaders([
                'Key' => $this->rajaongkirKey
            ])->get($this->rajaongkirBaseUrl . '/destination/district/' . $cityId);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['data']) && is_array($data['data'])) {
                    $districts = collect($data['data'])->map(function ($item) use ($cityId) {
                        return [
                            'subdistrict_id' => $item['id'],
                            'subdistrict_name' => $item['name'],
                            'city_id' => $cityId,
                            'type' => 'Kecamatan'
                        ];
                    })->toArray();

                    Log::info("Districts fetched successfully for city {$cityId}. Total: " . count($districts));

                    return response()->json([
                        'success' => true,
                        'data' => $districts,
                        'total' => count($districts),
                        'city_id' => $cityId
                    ]);
                } else {
                    throw new Exception('Invalid response structure from RajaOngkir API');
                }
            } else {
                throw new Exception('Failed to fetch districts: HTTP ' . $response->status() . ' - ' . $response->body());
            }

        } catch (Exception $e) {
            Log::error('RajaOngkir getDistricts error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data kecamatan',
                'error' => $e->getMessage(),
                'city_id' => $cityId
            ], 500);
        }
    }

    /**
     * Calculate shipping cost - DIPERBAIKI
     */
    public function calculateCost(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'origin' => 'required|string',
                'destination' => 'required|string', 
                'weight' => 'required|numeric|min:1',
                'courier' => 'required|string'
            ]);

            Log::info('Calculate cost request:', $validated);

            $courierCode = trim($request->courier);
            
            Log::info("Calculating cost for courier: {$courierCode}");
            Log::info("Request data: Origin={$request->origin}, Destination={$request->destination}, Weight={$request->weight}");
            
            $response = Http::timeout(30)
                ->withHeaders([
                    'Key' => $this->rajaongkirKey,
                    'Content-Type' => 'application/x-www-form-urlencoded'
                ])
                ->asForm()
                ->post($this->rajaongkirBaseUrl . '/calculate/district/domestic-cost', [
                    'origin' => $request->origin,
                    'destination' => $request->destination,
                    'weight' => $request->weight,
                    'courier' => $courierCode
                ]);

            Log::info("Response status for {$courierCode}: " . $response->status());
            Log::info("Response body: " . $response->body());

            if ($response->successful()) {
                $data = $response->json();
                
                // PERBAIKAN: Periksa struktur response baru
                if (isset($data['data']) && is_array($data['data']) && count($data['data']) > 0) {
                    Log::info("Successfully got costs for courier: {$courierCode}");
                    
                    return response()->json([
                        'success' => true,
                        'data' => $data['data'], // Langsung return data array
                        'total_options' => count($data['data']),
                        'request_params' => $validated,
                        'debug_info' => [
                            'origin' => $request->origin,
                            'destination' => $request->destination,
                            'weight' => $request->weight,
                            'courier' => $courierCode
                        ]
                    ]);
                } else {
                    Log::warning("No cost data for courier {$courierCode}. Response structure: " . json_encode($data));
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Tidak ada data ongkos kirim untuk kurir ini',
                        'data' => [],
                        'raw_response' => $data,
                        'debug_info' => [
                            'origin' => $request->origin,
                            'destination' => $request->destination,
                            'weight' => $request->weight,
                            'courier' => $courierCode
                        ]
                    ]);
                }
            } else {
                $errorBody = $response->body();
                Log::error("Failed to get cost for courier {$courierCode}: " . $response->status() . ' - ' . $errorBody);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menghitung ongkos kirim dari RajaOngkir API',
                    'error' => "HTTP {$response->status()}: {$errorBody}",
                    'data' => [],
                    'debug_info' => [
                        'origin' => $request->origin,
                        'destination' => $request->destination,
                        'weight' => $request->weight,
                        'courier' => $courierCode,
                        'http_status' => $response->status()
                    ]
                ], $response->status());
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error in calculateCost: ' . json_encode($e->errors()));
            return response()->json([
                'success' => false,
                'message' => 'Data input tidak valid',
                'errors' => $e->errors(),
                'data' => []
            ], 422);
            
        } catch (Exception $e) {
            Log::error('RajaOngkir calculateCost error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghitung ongkos kirim',
                'error' => $e->getMessage(),
                'data' => [],
                'request_data' => $request->all()
            ], 500);
        }
    }
}