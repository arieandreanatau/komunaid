<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Community;
use App\Models\Brand;
use App\Models\Event;
use App\Models\RoleRequest;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_members' => User::role('member')->count(),
            'total_communities' => Community::count(),
            'total_brands' => Brand::count(),
            'total_events' => Event::count(),
            'pending_communities' => Community::where('status', 'pending')->count(),
            'pending_brands' => Brand::where('status', 'pending')->count(),
            'pending_events' => Event::where('status', 'pending')->count(),
            'pending_role_requests' => RoleRequest::where('status', 'pending')->count(),
        ];

        $recentMembers = User::with('profile')
            ->role('member')
            ->latest()
            ->take(5)
            ->get();

        return view('superadmin.dashboard', compact('stats', 'recentMembers'));
    }
}
