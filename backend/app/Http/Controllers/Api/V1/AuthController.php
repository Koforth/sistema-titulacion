<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device' => ['nullable', 'string', 'max:100'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! $user->activo || ! Hash::check($data['password'], $user->password)) {
            Log::channel('single')->warning('Login fallido', ['email' => $data['email'], 'ip' => $request->ip()]);

            return response()->json(['message' => 'Credenciales inválidas.'], 422);
        }

        $token = $user->createToken($data['device'] ?? 'flutter', ['*'], now()->addHours(8))->plainTextToken;

        Log::info('Login correcto', ['user_id' => $user->id, 'ip' => $request->ip()]);

        return response()->json([
            'token' => $token,
            'user' => $user->only('id', 'name', 'email', 'role'),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->only('id', 'name', 'email', 'role'));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada.']);
    }
}
