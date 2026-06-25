<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Models\LoginLog;
use App\Services\Auth\RedirectByRoleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthenticatedSessionController extends Controller
{
    public function create()
    {
        if (Auth::check()) {
            $user = Auth::user();

            if ($user->isBannedOrSuspended()) {
                Auth::logout();
                return redirect()->route('account.restricted');
            }

            if ($user->hasRole('superadmin')) {
                return redirect()->route('superadmin.dashboard');
            }

            $redirectService = app(RedirectByRoleService::class);
            return redirect($redirectService->getRedirectPath($user));
        }

        return view('auth.login');
    }

    public function store(LoginRequest $request)
    {
        $login = $request->input('login');
        $password = $request->input('password');

        $user = User::where('email', $login)
            ->orWhere('username', $login)
            ->first();

        if (!$user) {
            LoginLog::create([
                'user_id' => null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'success' => false,
            ]);

            return back()->withErrors([
                'login' => 'Data login tidak sesuai.',
            ])->onlyInput('login');
        }

        if (!Hash::check($password, $user->password)) {
            LoginLog::create([
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'success' => false,
            ]);

            return back()->withErrors([
                'login' => 'Data login tidak sesuai.',
            ])->onlyInput('login');
        }

        if ($user->hasRole('superadmin')) {
            LoginLog::create([
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'success' => false,
            ]);

            return back()->withErrors([
                'login' => 'Akun ini adalah akun superadmin. Silakan login di admin panel.',
            ])->onlyInput('login');
        }

        if ($user->isBannedOrSuspended()) {
            Auth::login($user);
            $request->session()->regenerate();

            LoginLog::create([
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'success' => false,
            ]);

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('account.restricted');
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        LoginLog::create([
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'success' => true,
        ]);

        $redirectService = app(RedirectByRoleService::class);

        return redirect()->intended($redirectService->getRedirectPath($user));
    }

    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
