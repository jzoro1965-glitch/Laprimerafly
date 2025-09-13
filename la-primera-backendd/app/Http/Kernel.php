<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * These middleware are run during every request to your application.
     *
     * @var array<int, string>
     */
    protected $middleware = [
        // Mengelola trust proxies jika aplikasi berjalan di belakang load balancer/proxy
        \Illuminate\Http\Middleware\TrustProxies::class, 

        // Mencegah request saat aplikasi dalam mode maintenance
        \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,

        // Memvalidasi ukuran post data
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,

        // Mengubah string kosong menjadi null untuk konsistensi data
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
        
        // Memangkas spasi di awal dan akhir input string
        \Illuminate\Foundation\Http\Middleware\TrimStrings::class, 

        // Mengelola Cross-Origin Resource Sharing (CORS).
        // Ini adalah tempat yang umum untuk HandleCors di Laravel 11.
        \Illuminate\Http\Middleware\HandleCors::class, // <-- Pastikan ini aktif!
    ];

    /**
     * The application's route middleware groups.
     *
     * @var array<string, array<int, string>>
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            // Penting untuk otentikasi Sanctum di SPA/Mobile Apps.
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            
            // 'throttle:api', // Opsional: Batasi request API
            \Illuminate\Routing\Middleware\SubstituteBindings::class, // Otomatis menginject model ke route.
            // Catatan: HandleCors sudah dipindahkan ke $middleware global untuk coverage yang lebih luas.
        ],
    ];

    /**
     * The application's route middleware aliases.
     *
     * These middleware may be assigned to groups or individual routes.
     *
     * @var array<string, string>
     */
    protected $middlewareAliases = [ // <-- Pastikan ini adalah $middlewareAliases
        'auth' => \Illuminate\Auth\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
        'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class, // Mengalihkan user jika sudah login.
        'password.confirm' => \Illuminate\Auth\Middleware\RequirePasswordConfirmation::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,

        // Custom Middleware Anda:
        // 'admin' => \App\Http\Middleware\CheckAdminRole::class, // <-- Ini adalah perbaikan kuncinya!
    ];
}