<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureNotSuperadmin
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && (Auth::user()->hasRole('superadmin') || Auth::user()->hasRole('platform_admin'))) {
            return redirect()->route('superadmin.dashboard');
        }

        return $next($request);
    }
}
