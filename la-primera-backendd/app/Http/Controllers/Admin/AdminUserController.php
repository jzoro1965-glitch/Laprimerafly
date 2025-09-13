<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource; // Gunakan UserResource yang sama
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Tambahkan ini
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminUserController extends Controller
{
    /**
     * Display a listing of the users (for admin).
     */
    public function index(Request $request)
    {
        $users = User::query();

        if ($request->has('search')) {
            $search = $request->get('search');
            $users->where(function($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('role') && $request->get('role') !== 'all') {
            $users->where('role', $request->get('role'));
        }

        if ($request->has('is_active') && $request->get('is_active') !== 'all') {
            $users->where('is_active', (bool)$request->get('is_active'));
        }

        $users = $users->latest()->paginate(10);

        return UserResource::collection($users);
    }

    /**
     * Store a newly created user in storage (by admin).
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'phone' => 'nullable|string|max:20',
                'password' => 'required|string|min:8',
                'role' => ['required', 'string', Rule::in(['user', 'admin'])],
                'is_active' => 'boolean',
            ]);

            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'],
                'password' => Hash::make($validatedData['password']),
                'role' => $validatedData['role'],
                'is_active' => $validatedData['is_active'] ?? true, // Default true if not provided
            ]);

            return response()->json(['message' => 'User created successfully', 'data' => new UserResource($user)], 201);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'User creation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified user (for admin).
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Update the specified user in storage (by admin).
     */
    public function update(Request $request, User $user)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'phone' => 'nullable|string|max:20',
                'password' => 'nullable|string|min:8', // Admin can change password
                'role' => ['required', 'string', Rule::in(['user', 'admin'])],
                'is_active' => 'boolean',
            ]);

            if (isset($validatedData['password'])) {
                $validatedData['password'] = Hash::make($validatedData['password']);
            }

            $user->update($validatedData);

            return response()->json(['message' => 'User updated successfully', 'data' => new UserResource($user)], 200);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'User update failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified user from storage (by admin).
     */
    public function destroy(User $user)
    {
        // Admin cannot delete their own account (optional security check)
        if (Auth::id() === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        try {
            // Consider soft deleting instead of hard deleting (add SoftDeletes trait to User model)
            $user->delete(); // This will hard delete.
            return response()->json(['message' => 'User deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'User deletion failed: ' . $e->getMessage()], 500);
        }
    }
}