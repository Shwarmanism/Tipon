<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function loginForm()
    {
        return view('auth.login');
    }

    public function loginSubmit(Request $request)
    {
        // 1. Validate incoming JSON data from React
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 2. Attempt login
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // 3. Generate a Sanctum Token for React to store
            $token = $user->createToken('tipon_token')->plainTextToken;

            // 4. Return success and the token as JSON
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user
            ], 200);
        }

        // 5. If login fails, return a 401 error with JSON
        return response()->json([
            'errors' => [
                'email' => 'The provided credentials do not match our records.'
            ]
        ], 401);
    }

    public function registerForm()
    {
        return view('auth.register');
    }

    public function registerSubmit(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 
                'string', 
                'email', 
                'max:255', 
                'unique:users',
                'regex:/^[a-zA-Z0-9._%+-]+@iskolarngbayan\.pup\.edu\.ph$/'
            ],
            'password' => ['required', 'min:8', 'confirmed'],
            'role' => ['required'],
        ], [
            'email.regex' => 'You must use a valid @iskolarngbayan.pup.edu.ph email address to register.',
            'role.required' => 'Please select a role.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), 
            'role' => $request->role,
            'created_at' => now(),
        ]);

        Auth::login($user);

        $token = $user->createToken('tipon_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully! Welcome to Tipon.',
            'token' => $token,
            'user' => $user
        ], 201);
    }


    public function logout(Request $request)
    {
        Auth::logout();

        // Invalidate the session and clear the CSRF token for security
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')
                         ->with('success', 'You have been logged out.');
    }
}