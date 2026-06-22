<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Community;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $user->load('profile', 'roleRequests');

        $joinedCommunities = $user->joinedCommunities()->with('category')->get();
        $memberCount = $joinedCommunities->count();

        return view('member.dashboard', compact('user', 'joinedCommunities', 'memberCount'));
    }
}
