<?php
// config/cors.php 
return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | to prevent unauthorized access from other domains. This determines
    | what cross-origin operations may execute in web browsers.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'register', 'admin/*'], // Tambahkan rute admin Anda
    'allowed_methods' => ['*'], // Izinkan semua metode HTTP (GET, POST, PUT, PATCH, DELETE, OPTIONS)
    'allowed_origins' => ['http://localhost:5173'], // Ganti dengan URL frontend React Anda
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'], // Izinkan semua header request
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // Penting untuk Sanctum jika Anda mengirim cookie/token



];