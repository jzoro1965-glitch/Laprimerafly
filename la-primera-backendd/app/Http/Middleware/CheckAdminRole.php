<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    public function handle(Request $request, Closure $next): Response
    {
        // Debug: Log untuk melihat apakah middleware dipanggil
        Log::info('CheckAdminRole middleware called');
        
        // Pastikan user sudah login
        if (!Auth::check()) {
            Log::info('User not authenticated');
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = Auth::user();
        Log::info('User role: ' . $user->role);

        // Periksa apakah user yang login memiliki peran 'admin'
        if ($user->role !== 'admin') {
            Log::info('User does not have admin role');
            return response()->json(['message' => 'Forbidden. You do not have admin access.'], 403);
        }

        Log::info('Admin access granted');
        return $next($request);
    }
}