<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Friendship;
use App\Models\CommunityBookmark;
use App\Models\MemberGallery;
use App\Models\Event;
use App\Services\Finance\WalletService;

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

        $friendsCount = Friendship::where(function ($q) use ($user) {
            $q->where('requester_id', $user->id)->orWhere('addressee_id', $user->id);
        })->where('status', 'accepted')->count();

        $bookmarksCount = CommunityBookmark::where('user_id', $user->id)->count();

        $galleryCount = MemberGallery::where('user_id', $user->id)->count();

        $interestsCount = $user->interests()->count();

        $recentRoleRequests = $user->roleRequests()->latest()->limit(3)->get();

        $upcomingEvents = $user->eventRegistrations()
            ->with('event.community')
            ->whereHas('event', function ($q) {
                $q->where('start_datetime', '>', now());
            })
            ->where('status', 'registered')
            ->latest()
            ->limit(5)
            ->get();

        $interestIds = $user->interests()->pluck('interests.id')->toArray();
        $joinedIds = $joinedCommunities->pluck('id')->toArray();

        $recommendedCommunities = Community::where('status', 'approved')
            ->where('is_public', true)
            ->whereNotIn('id', $joinedIds)
            ->where(function ($q) use ($interestIds) {
                $q->where('is_recommended', true)
                    ->orWhere('is_featured', true);
            })
            ->with('category')
            ->limit(6)
            ->get();

        if ($recommendedCommunities->count() < 6 && !empty($interestIds)) {
            $existingIds = $recommendedCommunities->pluck('id')->toArray();
            $allIds = array_merge($joinedIds, $existingIds);

            $moreCommunities = Community::where('status', 'approved')
                ->where('is_public', true)
                ->whereNotIn('id', $allIds)
                ->with('category')
                ->limit(6 - $recommendedCommunities->count())
                ->get();

            $recommendedCommunities = $recommendedCommunities->concat($moreCommunities);
        }

        return view('member.dashboard', compact(
            'user',
            'joinedCommunities',
            'memberCount',
            'walletBalance',
            'eventCount',
            'friendsCount',
            'bookmarksCount',
            'galleryCount',
            'interestsCount',
            'recentRoleRequests',
            'upcomingEvents',
            'recommendedCommunities'
        ));
    }
}
