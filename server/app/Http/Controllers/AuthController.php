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
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            // Regenerate the session ID to prevent session fixation attacks
            $request->session()->regenerate();

            $user = Auth::user();
            if ($user->role === 'admin') {
                // Admins
                return redirect()->route('admin.dashboard')
                                 ->with('success', 'Welcome back, Admin!');
            }

            // Normal user
            return redirect()->route('welcome')
                             ->with('success', 'Successfully logged in.');
        }

        // If authentication fails, send them back with an error message
        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email'); 
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
            'role' => 'normal',
            'created_at' => now(),
        ]);

        Auth::login($user);

        return redirect()->route('welcome')
                         ->with('success', 'Account created successfully! Welcome to Tipon.');
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