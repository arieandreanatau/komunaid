<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\CollaborationRequest;
use App\Models\Community;
use App\Models\CommunityBan;
use App\Models\CommunityMember;
use App\Models\Donation;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\MemberJoinHistory;
use App\Services\Finance\WalletService;
use App\Services\Finance\PlatformFeeService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $ownedCommunities = Community::where('owner_id', $user->id)
            ->with('category')
            ->latest()
            ->get();

        $communityIds = $ownedCommunities->pluck('id');

        $totalMembers = CommunityMember::whereIn('community_id', $communityIds)
            ->where('status', 'active')
            ->count();

        $totalCommunities = $ownedCommunities->count();
        $pendingCommunities = $ownedCommunities->where('status', 'pending')->count();
        $approvedCommunities = $ownedCommunities->where('status', 'approved')->count();

        $totalBans = CommunityBan::whereIn('community_id', $communityIds)
            ->where('status', 'active')
            ->count();

        $totalEvents = Event::whereIn('community_id', $communityIds)->count();
        $totalEventsPaid = Event::whereIn('community_id', $communityIds)->where('event_type', 'paid')->count();
        $totalEventsFree = Event::whereIn('community_id', $communityIds)->where('event_type', 'free')->count();

        $totalCollaborations = CollaborationRequest::whereIn('community_id', $communityIds)->count();

        $walletService = app(WalletService::class);
        $wallet = $walletService->getOrCreateWallet($user);

        $totalDonationConfirmed = Donation::whereIn('community_id', $communityIds)->where('status', 'confirmed')->sum('amount');

        $totalEventIncome = 0;
        $platformFeeService = app(PlatformFeeService::class);
        foreach ($ownedCommunities as $community) {
            $totalEventIncome += $platformFeeService->getCommunityNetIncome($community->id);
        }

        $stats = [
            'total_communities' => $totalCommunities,
            'pending_communities' => $pendingCommunities,
            'approved_communities' => $approvedCommunities,
            'total_members' => $totalMembers,
            'total_events' => $totalEvents,
            'total_events_paid' => $totalEventsPaid,
            'total_events_free' => $totalEventsFree,
            'total_collaborations' => $totalCollaborations,
            'total_donation_ledger' => $totalDonationConfirmed,
            'total_event_income' => $totalEventIncome,
            'wallet_balance' => $wallet->balance,
            'total_bans' => $totalBans,
        ];

        return view('community.dashboard', compact('user', 'ownedCommunities', 'stats'));
    }
}
