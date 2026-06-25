<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureSuperadmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return redirect()->route('admin.login');
        }

        $user = Auth::user();

        if ($user->status === 'banned' || $user->status === 'suspended' || $user->banned_at !== null) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('account.restricted');
        }

        if (!$user->hasRole('superadmin') && !$user->hasRole('platform_admin')) {
            abort(403);
        }

        return $next($request);
    }
}
