<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardRedirectController extends Controller
{
    public function __invoke()
    {
        $user = Auth::user();

        if ($user->hasRole('superadmin')) {
            return redirect()->route('superadmin.dashboard');
        } elseif ($user->hasRole('community_owner')) {
            return redirect()->route('community-owner.dashboard');
        } elseif ($user->hasRole('brand_owner')) {
            return redirect()->route('brand-owner.dashboard');
        }

        return redirect()->route('member.dashboard');
    }
}
