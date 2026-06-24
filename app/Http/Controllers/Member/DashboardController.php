<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Services\WalletService;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $user->load('profile', 'roleRequests');

        $joinedCommunities = $user->joinedCommunities()->with('category')->get();
        $memberCount = $joinedCommunities->count();

        $walletService = app(WalletService::class);
        $walletBalance = $walletService->getBalance($user);
        $eventCount = $user->eventRegistrations()->where('status', 'registered')->count();

        return view('member.dashboard', compact('user', 'joinedCommunities', 'memberCount', 'walletBalance', 'eventCount'));
    }
}
