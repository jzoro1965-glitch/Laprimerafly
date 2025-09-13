// src/utils/rajaOngkirApi.js - PERBAIKAN dengan abort controller dan cache
const API_BASE_URL = 'http://localhost:8000/api'; 

class RajaOngkirAPI {
    constructor() {
        this.baseURL = `${API_BASE_URL}/rajaongkir`;
        this.originDistrictId = '575'; // District ID yang valid
        this.requestCache = new Map();
        this.abortControllers = new Map();
    }

    /**
     * Make HTTP request dengan abort controller
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Generate unique request ID untuk abort controller
        const requestId = `${endpoint}_${Date.now()}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            },
            ...options
        };

        // Add abort signal jika ada
        if (options.signal) {
            config.signal = options.signal;
        }

        try {
            console.log('Making request to:', url);
            console.log('Request config:', config);
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Laravel API endpoint tidak ditemukan. Pastikan routes sudah terdaftar.');
                } else if (response.status === 500) {
                    throw new Error('Laravel server error. Check Laravel logs.');
                } else if (response.status === 0 || !response.status) {
                    throw new Error('Tidak dapat terhubung ke Laravel server. Pastikan server berjalan di http://localhost:8000');
                }
                
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Response received:', data);
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.message || 'API Error');
            }
        } catch (error) {
            // Skip jika request di-abort
            if (error.name === 'AbortError') {
                console.log('Request aborted:', url);
                throw error;
            }
            
            console.error('API Error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Laravel server tidak berjalan. Jalankan: php artisan serve');
            }
            
            throw error;
        }
    }

    /**
     * Get provinces
     */
    async getProvinces(signal) {
        try {
            const data = await this.makeRequest('/provinces', { signal });
            return Array.isArray(data) ? data : [];
        } catch (error) {
            if (error.name === 'AbortError') throw error;
            
            console.error('Error fetching provinces:', error);
            
            if (error.message.includes('server tidak berjalan')) {
                throw new Error('Laravel server tidak berjalan. Jalankan "php artisan serve" di terminal.');
            } else if (error.message.includes('tidak ditemukan')) {
                throw new Error('API route belum terdaftar. Pastikan routes/api.php sudah dikonfigurasi.');
            }
            
            throw new Error('Gagal memuat data provinsi: ' + error.message);
        }
    }

    /**
     * Get cities
     */
    async getCities(provinceId, signal) {
        if (!provinceId) {
            throw new Error('Province ID is required');
        }

        try {
            const data = await this.makeRequest(`/cities/${provinceId}`, { signal });
            return Array.isArray(data) ? data : [];
        } catch (error) {
            if (error.name === 'AbortError') throw error;
            
            console.error('Error fetching cities:', error);
            throw new Error('Gagal memuat data kota: ' + error.message);
        }
    }

    /**
     * Get districts
     */
    async getDistricts(cityId, signal) {
        if (!cityId) {
            throw new Error('City ID is required');
        }

        try {
            const data = await this.makeRequest(`/districts/${cityId}`, { signal });
            return Array.isArray(data) ? data : [];
        } catch (error) {
            if (error.name === 'AbortError') throw error;
            
            console.error('Error fetching districts:', error);
            throw new Error('Gagal memuat data kecamatan: ' + error.message);
        }
    }

    /**
     * Calculate total weight
     */
    calculateTotalWeight(cartItems = []) {
        let totalWeight = 0;
        
        cartItems.forEach(item => {
            const itemWeight = item.product?.weight || 500;
            totalWeight += itemWeight * item.quantity;
        });

        return Math.max(totalWeight, 1000);
    }

    /**
     * Calculate shipping cost dengan abort controller
     */
    async calculateDomesticCost({ origin, destination, weight, courier }, signal) {
        if (!origin || !destination || !weight || !courier) {
            throw new Error('Origin, destination, weight, and courier are required');
        }

        console.log('Calculating cost with params:', { origin, destination, weight, courier });

        try {
            const data = await this.makeRequest('/calculate-cost', {
                method: 'POST',
                signal,
                body: JSON.stringify({
                    origin: origin.toString(),
                    destination: destination.toString(),
                    weight: weight.toString(),
                    courier: courier
                })
            });

            console.log('Raw calculate cost response:', data);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            if (error.name === 'AbortError') throw error;
            
            console.error('Error calculating shipping cost:', error);
            throw new Error('Gagal menghitung ongkos kirim: ' + error.message);
        }
    }

    /**
     * Get shipping options dengan rate limiting dan caching
     */
    async getShippingOptions(params, cartItems = [], signal) {
        const couriers = ['jne', 'pos', 'tiki'];
        const options = [];
        const totalWeight = this.calculateTotalWeight(cartItems);

        // Generate cache key
        const cacheKey = `${params.origin || this.originDistrictId}_${params.destination}_${totalWeight}`;
        
        // Check cache first
        if (this.requestCache.has(cacheKey)) {
            console.log('Using cached shipping options');
            return this.requestCache.get(cacheKey);
        }

        console.log('Getting shipping options with params:', {
            origin: params.origin || this.originDistrictId,
            destination: params.destination,
            weight: totalWeight
        });

        try {
            // Proses semua courier dengan rate limiting
            for (let i = 0; i < couriers.length; i++) {
                const courier = couriers[i];
                
                // Check if request was aborted
                if (signal && signal.aborted) {
                    throw new Error('Request aborted');
                }
                
                try {
                    console.log(`\n=== Testing ${courier.toUpperCase()} ===`);
                    
                    const costs = await this.calculateDomesticCost({
                        origin: params.origin || this.originDistrictId,
                        destination: params.destination,
                        weight: totalWeight,
                        courier: courier
                    }, signal);

                    console.log(`${courier} response:`, costs);

                    // Parse response structure
                    if (costs && Array.isArray(costs) && costs.length > 0) {
                        costs.forEach(serviceData => {
                            if (serviceData.cost && serviceData.service) {
                                options.push({
                                    id: `${serviceData.code}-${serviceData.service}`,
                                    courier: serviceData.name,
                                    courierCode: serviceData.code,
                                    service: serviceData.service,
                                    description: serviceData.description,
                                    cost: parseInt(serviceData.cost),
                                    etd: serviceData.etd || 'N/A',
                                    note: '',
                                    label: `${serviceData.name} ${serviceData.service} (${serviceData.etd || 'N/A'})`
                                });
                            }
                        });
                    }

                    // Rate limiting delay - tapi skip untuk yang terakhir
                    if (i < couriers.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 800));
                    }
                    
                } catch (courierError) {
                    if (courierError.name === 'AbortError') throw courierError;
                    
                    console.error(`Error with ${courier}:`, courierError);
                    continue; // Lanjut ke courier berikutnya
                }
            }

            // Sort by cost
            const sortedOptions = options.sort((a, b) => a.cost - b.cost);
            
            // Cache the result
            this.requestCache.set(cacheKey, sortedOptions);
            
            // Cleanup old cache entries (keep only 50 entries)
            if (this.requestCache.size > 50) {
                const firstKey = this.requestCache.keys().next().value;
                this.requestCache.delete(firstKey);
            }

            console.log('Final shipping options:', sortedOptions);
            return sortedOptions;
            
        } catch (error) {
            if (error.name === 'AbortError') throw error;
            
            console.error('Error getting shipping options:', error);
            throw error;
        }
    }

    /**
     * Format shipping options
     */
    formatShippingOptions(options) {
        return options.map(option => ({
            ...option,
            formattedCost: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(option.cost),
            formattedEtd: option.etd === 'N/A' ? 'Estimasi tidak tersedia' : `${option.etd}`
        }));
    }

    /**
     * Set origin district
     */
    setOrigin(districtId) {
        this.originDistrictId = districtId.toString();
        // Clear cache when origin changes
        this.requestCache.clear();
    }

    /**
     * Get current origin
     */
    getOrigin() {
        return this.originDistrictId;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.requestCache.clear();
        console.log('Cache cleared');
    }

    /**
     * Abort all pending requests
     */
    abortAllRequests() {
        this.abortControllers.forEach((controller, requestId) => {
            controller.abort();
        });
        this.abortControllers.clear();
        console.log('All requests aborted');
    }
}

const rajaOngkirAPI = new RajaOngkirAPI();

export { rajaOngkirAPI };