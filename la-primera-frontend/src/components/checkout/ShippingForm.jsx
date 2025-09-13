// src/components/checkout/ShippingForm.jsx - DENGAN FIELD PERSONAL INFO
import { useEffect, useState, useCallback, useRef } from 'react';
import { rajaOngkirAPI } from '../../utils/rajaOngkirApi';
import { useCart } from '../../hooks/useCart';

export default function ShippingForm({ formData, handleInputChange, onShippingCostUpdate }) {
  const { cartItems } = useCart();
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // PERBAIKAN 1: Gunakan ref untuk mencegah loop
  const lastDistrictId = useRef(null);
  const shippingOptionsCache = useRef(new Map());
  const abortController = useRef(null);

  // PERBAIKAN 2: Callback stabil tanpa dependency yang berubah
  const updateShippingOptions = useCallback((options) => {
    console.log('Updating shipping options:', options);
    setShippingOptions(options);
    
    if (onShippingCostUpdate && typeof onShippingCostUpdate === 'function') {
      onShippingCostUpdate(options);
    }
  }, []); // Dependency kosong agar tidak berubah

  // Ambil provinsi saat pertama kali render
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setError('');
        console.log('Fetching provinces...');
        const data = await rajaOngkirAPI.getProvinces();
        console.log('Provinces received:', data);
        setProvinces(data || []);
      } catch (error) {
        console.error('Gagal memuat provinsi:', error);
        setError('Gagal memuat data provinsi');
        setProvinces([]);
      }
    };
    fetchProvinces();
  }, []);

  // Ambil kota berdasarkan provinsi
  useEffect(() => {
    if (formData.provinceId) {
      const fetchCities = async () => {
        try {
          setError('');
          console.log('Fetching cities for province:', formData.provinceId);
          const data = await rajaOngkirAPI.getCities(formData.provinceId);
          console.log('Cities received:', data);
          setCities(data || []);
          
          // Reset data yang bergantung
          setDistricts([]);
          setShippingOptions([]);
          updateShippingOptions([]);
        } catch (error) {
          console.error('Gagal memuat kota:', error);
          setError('Gagal memuat data kota');
          setCities([]);
          setDistricts([]);
          setShippingOptions([]);
        }
      };
      fetchCities();
    } else {
      setCities([]);
      setDistricts([]);
      setShippingOptions([]);
      updateShippingOptions([]);
    }
  }, [formData.provinceId, updateShippingOptions]);

  // Ambil kecamatan berdasarkan kota
  useEffect(() => {
    if (formData.cityId) {
      const fetchDistricts = async () => {
        try {
          setError('');
          console.log('Fetching districts for city:', formData.cityId);
          const data = await rajaOngkirAPI.getDistricts(formData.cityId);
          console.log('Districts received:', data);
          setDistricts(data || []);
          
          // Reset shipping options
          setShippingOptions([]);
          updateShippingOptions([]);
        } catch (error) {
          console.error('Gagal memuat kecamatan:', error);
          setError('Gagal memuat data kecamatan');
          setDistricts([]);
          setShippingOptions([]);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setShippingOptions([]);
      updateShippingOptions([]);
    }
  }, [formData.cityId, updateShippingOptions]);

  // PERBAIKAN 3: Shipping cost dengan cache dan abort controller
  useEffect(() => {
    const fetchShippingOptions = async () => {
      // Validasi data yang dibutuhkan
      if (!formData.districtId || !cartItems || cartItems.length === 0) {
        console.log('Missing district ID or cart items:', { 
          districtId: formData.districtId, 
          cartItemsCount: cartItems?.length 
        });
        return;
      }

      // PERBAIKAN 4: Cek apakah district ID berubah
      if (lastDistrictId.current === formData.districtId) {
        console.log('District ID tidak berubah, skip fetch');
        return;
      }

      // PERBAIKAN 5: Cek cache terlebih dahulu
      const cacheKey = `${formData.districtId}_${cartItems.length}`;
      if (shippingOptionsCache.current.has(cacheKey)) {
        console.log('Using cached shipping options');
        const cachedOptions = shippingOptionsCache.current.get(cacheKey);
        setShippingOptions(cachedOptions);
        updateShippingOptions(cachedOptions);
        return;
      }

      // PERBAIKAN 6: Abort request sebelumnya
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      // Update ref untuk mencegah duplicate calls
      lastDistrictId.current = formData.districtId;

      setLoading(true);
      setError('');
      
      try {
        console.log('Calculating shipping cost...', {
          destination: formData.districtId,
          cartItems: cartItems.length
        });

        const options = await rajaOngkirAPI.getShippingOptions(
          { destination: formData.districtId },
          cartItems
        );
        
        console.log('Shipping options received:', options);
        
        if (options && options.length > 0) {
          const formatted = rajaOngkirAPI.formatShippingOptions(options);
          console.log('Formatted shipping options:', formatted);
          
          // PERBAIKAN 7: Simpan ke cache
          shippingOptionsCache.current.set(cacheKey, formatted);
          
          setShippingOptions(formatted);
          updateShippingOptions(formatted);
        } else {
          console.log('No shipping options available');
          setShippingOptions([]);
          updateShippingOptions([]);
          setError('Tidak ada layanan pengiriman tersedia untuk wilayah ini');
        }
      } catch (error) {
        // Skip error jika request di-abort
        if (error.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        
        console.error('Error calculating shipping cost:', error);
        setError('Gagal menghitung ongkos kirim: ' + error.message);
        setShippingOptions([]);
        updateShippingOptions([]);
      } finally {
        setLoading(false);
        abortController.current = null;
      }
    };

    // PERBAIKAN 8: Debounce dengan timeout
    const timeoutId = setTimeout(() => {
      if (formData.districtId) {
        fetchShippingOptions();
      }
    }, 1000); // Delay 1 detik untuk menghindari spam

    return () => {
      clearTimeout(timeoutId);
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [formData.districtId, cartItems]); // Hapus updateShippingOptions dari dependency

  // PERBAIKAN 9: Cleanup saat unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      shippingOptionsCache.current.clear();
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Pengiriman</h2>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* SECTION 1: INFORMASI PERSONAL */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Informasi Personal
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama Depan */}
          <div>
            <label className="block text-sm font-medium mb-2">Nama Depan *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleInputChange}
              className="w-full border rounded p-3 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="Masukkan nama depan"
              required
            />
          </div>

          {/* Nama Belakang */}
          <div>
            <label className="block text-sm font-medium mb-2">Nama Belakang *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleInputChange}
              className="w-full border rounded p-3 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="Masukkan nama belakang"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="w-full border rounded p-3 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="contoh@email.com"
              required
            />
          </div>

          {/* Nomor Telepon */}
          <div>
            <label className="block text-sm font-medium mb-2">Nomor Telepon *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              className="w-full border rounded p-3 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: ALAMAT LENGKAP */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Alamat Pengiriman
        </h3>

        <div className="space-y-4">
          {/* Alamat Lengkap */}
          <div>
            <label className="block text-sm font-medium mb-2">Alamat Lengkap *</label>
            <textarea
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full border rounded p-3 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="Masukkan alamat lengkap (nama jalan, nomor rumah, RT/RW, dll.)"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Select Provinsi */}
            <div>
              <label className="block text-sm font-medium mb-2">Provinsi *</label>
              <select
                name="provinceId"
                value={formData.provinceId || ''}
                onChange={(e) => {
                  // Clear cache saat province berubah
                  shippingOptionsCache.current.clear();
                  lastDistrictId.current = null;
                  handleInputChange(e);
                }}
                className="w-full border rounded p-3 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                required
              >
                <option value="">-- Pilih Provinsi --</option>
                {provinces.map((prov) => (
                  <option key={prov.province_id} value={prov.province_id}>
                    {prov.province}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Kota */}
            <div>
              <label className="block text-sm font-medium mb-2">Kota/Kabupaten *</label>
              <select
                name="cityId"
                value={formData.cityId || ''}
                onChange={(e) => {
                  // Clear cache saat city berubah
                  shippingOptionsCache.current.clear();
                  lastDistrictId.current = null;
                  handleInputChange(e);
                }}
                className="w-full border rounded p-3 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                disabled={!formData.provinceId || cities.length === 0}
                required
              >
                <option value="">
                  {!formData.provinceId ? "-- Pilih Provinsi Terlebih Dahulu --" : "-- Pilih Kota --"}
                </option>
                {cities.map((city) => (
                  <option key={city.city_id} value={city.city_id}>
                    {city.type} {city.city_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Kecamatan */}
            <div>
              <label className="block text-sm font-medium mb-2">Kecamatan *</label>
              <select
                name="districtId"
                value={formData.districtId || ''}
                onChange={(e) => {
                  // Clear last district untuk trigger fetch
                  lastDistrictId.current = null;
                  handleInputChange(e);
                }}
                className="w-full border rounded p-3 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                disabled={!formData.cityId || districts.length === 0}
                required
              >
                <option value="">
                  {!formData.cityId ? "-- Pilih Kota Terlebih Dahulu --" : "-- Pilih Kecamatan --"}
                </option>
                {districts.map((district) => (
                  <option key={district.subdistrict_id} value={district.subdistrict_id}>
                    {district.subdistrict_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kode Pos */}
            <div>
              <label className="block text-sm font-medium mb-2">Kode Pos *</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode || ''}
                onChange={handleInputChange}
                className="w-full border rounded p-3 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="12345"
                maxLength="5"
                pattern="[0-9]{5}"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: PILIHAN PENGIRIMAN */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Ongkos Kirim
        </h3>
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-8 border rounded bg-white">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              <span className="text-gray-600">Menghitung ongkir...</span>
            </div>
          </div>
        )}

        {/* No District Selected */}
        {!loading && !formData.districtId && (
          <div className="p-4 border rounded bg-white text-gray-500 text-center">
            Pilih kecamatan terlebih dahulu untuk melihat pilihan pengiriman
          </div>
        )}

        {/* Shipping Options Available */}
        {!loading && formData.districtId && shippingOptions.length > 0 && (
          <div>
            <select
              name="shippingOption"
              value={formData.shippingOption || ''}
              onChange={handleInputChange}
              className="w-full border rounded p-3 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
              required
            >
              <option value="">-- Pilih Layanan Pengiriman --</option>
              {shippingOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} - {option.formattedCost}
                </option>
              ))}
            </select>

            {/* Status indicator */}
            <div className="mt-2 flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {shippingOptions.length} layanan pengiriman tersedia
            </div>
          </div>
        )}

        {/* No Shipping Options */}
        {!loading && formData.districtId && shippingOptions.length === 0 && !error && (
          <div className="p-4 border rounded bg-yellow-50 text-yellow-700 text-center">
            Tidak ada layanan pengiriman tersedia untuk wilayah ini
          </div>
        )}
      </div>

      {/* Debug info - hapus di production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-3 rounded text-xs">
          <strong>Debug Info:</strong>
          <br />
          Name: {formData.firstName} {formData.lastName} | Email: {formData.email} | Phone: {formData.phone}
          <br />
          Province: {formData.provinceId} | City: {formData.cityId} | District: {formData.districtId}
          <br />
          Cart Items: {cartItems?.length || 0} | Shipping Options: {shippingOptions.length}
          <br />
          Loading: {loading.toString()} | Error: {error || 'None'}
          <br />
          Last District: {lastDistrictId.current} | Cache Size: {shippingOptionsCache.current.size}
        </div>
      )}
    </div>
  );
}