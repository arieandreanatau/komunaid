<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;

class DashboardController extends Controller
{
    public function index()
    {
        $communities = auth()->user()->ownedCommunities()->withCount([
            'members' => fn($q) => $q->wherePivot('status', 'approved'),
        ])->get();

        $totalMembers = $communities->sum('members_count');
        $totalEvents = $communities->sum(fn($c) => $c->events()->count());
        $pendingJoins = \App\Models\CommunityMember::whereIn('community_id', $communities->pluck('id'))
            ->where('status', 'pending')
            ->count();

        return view('community-owner.dashboard', compact('communities', 'totalMembers', 'totalEvents', 'pendingJoins'));
    }
}
