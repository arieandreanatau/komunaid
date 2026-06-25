<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        if (Auth::check() && Auth::user()->hasRole('superadmin')) {
            return redirect()->route('superadmin.dashboard');
        }

        return view('superadmin.auth.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ], [
            'login.required' => 'Email atau username wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $login = $request->input('login');
        $password = $request->input('password');

        $user = User::where('email', $login)
            ->orWhere('username', $login)
            ->first();

        if (!$user || !Auth::attempt(['email' => $user->email, 'password' => $password], $request->boolean('remember'))) {
            LoginLog::create([
                'user_id' => null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'success' => false,
            ]);

            return back()->withErrors([
                'login' => 'Email atau password salah.',
            ])->onlyInput('login');
        }

        if (!$user->hasRole('superadmin')) {
            Auth::logout();
            return back()->withErrors([
                'login' => 'Akun ini bukan akun superadmin.',
            ])->onlyInput('login');
        }

        if ($user->banned_at !== null) {
            Auth::logout();
            return back()->withErrors([
                'login' => 'Akun ini telah dibanned.',
            ])->onlyInput('login');
        }

        $request->session()->regenerate();

        LoginLog::create([
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'success' => true,
        ]);

        return redirect()->intended(route('superadmin.dashboard'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
