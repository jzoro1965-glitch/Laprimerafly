<?php
// UserController.php 
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule; // <-- Pastikan ini di-import
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Memperbarui informasi profil user yang sedang login.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name'       => 'required|string|max:255',
            'email'      => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone'      => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'gender'     => ['nullable', 'string', Rule::in(['male', 'female', 'other'])],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $user->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Memperbarui password user yang sedang login.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password'         => ['required', 'string', 'confirmed', Password::min(8)],
        ]);
        
        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'The provided password does not match your current password.',
                'errors' => ['current_password' => ['Password saat ini tidak cocok.']]
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diperbarui.'
        ]);
    }

    /**
     * Memperbarui avatar user yang sedang login.
     */
    public function updateAvatar(Request $request)
    {
        // --- BAGIAN YANG DIUBAH ---
        // Kita gunakan aturan validasi yang berbeda untuk memastikan file adalah gambar
        $validator = Validator::make($request->all(), [
            'avatar' => [
                'required',
                'file', // Pastikan ini adalah file
                'mimes:jpeg,png,jpg', // Cek ekstensi
                'max:2048', // Maksimal 2MB
                Rule::dimensions()->minWidth(100)->minHeight(100), // Memastikan file ini adalah gambar dengan mengecek dimensinya
            ],
        ]);
        // --- AKHIR BAGIAN YANG DIUBAH ---

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        
        $user->update(['avatar' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar berhasil diperbarui.',
            'data' => new UserResource($user)
        ]);


        
    }
}