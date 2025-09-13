<?php
// bootstrap/app.php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Ini adalah tempat untuk mendaftarkan middleware.
        // Middleware global (untuk setiap request) bisa ditambahkan di sini.
        // Contoh:
        $middleware->web(append: [
            // \App\Http\Middleware\TrustHosts::class, // Contoh middleware web
        ]);

        $middleware->api(prepend: [
            // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class, // Sudah otomatis jika menggunakan Sanctum
            \Illuminate\Http\Middleware\HandleCors::class, // <-- Pastikan ini ada di sini atau di $middleware Kernel.php
        ]);

        // ===== PENAMBAHAN ALIAS MIDDELWARE KUSTOM ANDA DI SINI =====
        $middleware->alias([
            'admin' => \App\Http\Middleware\CheckAdminRole::class, // <-- TAMBAHKAN BARIS INI
            'auth' => \Illuminate\Auth\Middleware\Authenticate::class, // Mungkin sudah ada atau bisa ditambahkan
            'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
            // Tambahkan alias middleware standar lainnya jika Anda memerlukannya di sini
            // atau pastikan tidak ada duplikasi jika sudah di Kernel.php
        ]);
        // ==========================================================

        // Jika Anda ingin mengedit atau menambahkan middleware ke grup default Laravel
        // $middleware->appendToGroup('api', [
        //     // \App\Http\Middleware\AnotherApiMiddleware::class,
        // ]);

        // Middleware yang akan ditambahkan ke web routes secara default
        // $middleware->alias([
        //     //
        // ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();