<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Event;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $joinedCommunities = $user->memberCommunities()
            ->wherePivot('status', 'approved')
            ->withCount('events')
            ->get();

        $upcomingEvents = Event::whereHas('registrations', fn($q) => $q->where('user_id', $user->id)->where('status', 'registered'))
            ->where('start_date', '>', now())
            ->with('community')
            ->orderBy('start_date')
            ->get();

        return view('member.dashboard', compact('joinedCommunities', 'upcomingEvents'));
    }
}
