<?php

namespace App\Http\Controllers;

use App\Models\Community;
use App\Models\Event;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $featuredCommunities = Community::where('status', 'approved')
            ->where('is_public', true)
            ->withCount('members')
            ->orderByDesc('members_count')
            ->take(6)
            ->get();

        $upcomingEvents = Event::where('status', 'approved')
            ->where('start_date', '>', now())
            ->with('community')
            ->orderBy('start_date')
            ->take(4)
            ->get();

        $stats = [
            'communities' => Community::where('status', 'approved')->count(),
            'members' => \App\Models\User::role('member')->count(),
            'brands' => \App\Models\Brand::where('status', 'approved')->count(),
            'events' => Event::where('status', 'approved')->count(),
        ];

        return view('landing.index', compact('featuredCommunities', 'upcomingEvents', 'stats'));
    }
}
