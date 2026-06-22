<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityCategory;
use Illuminate\Http\Request;

class CommunityDirectoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Community::with(['category', 'owner'])
            ->withCount('activeMembers')
            ->where('status', 'approved')
            ->where('is_public', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('region', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('region')) {
            $query->where('region', $request->region);
        }

        if ($request->filled('member_sort')) {
            $query->withCount('activeMembers');
            if ($request->member_sort === 'most') {
                $query->orderByDesc('active_members_count');
            } elseif ($request->member_sort === 'least') {
                $query->orderBy('active_members_count');
            }
        } else {
            $query->latest();
        }

        $communities = $query->paginate(12)->withQueryString();
        $categories = CommunityCategory::where('is_active', true)->get();
        $regions = Community::where('status', 'approved')
            ->whereNotNull('region')
            ->distinct()
            ->pluck('region');

        return view('guest.community-directory', compact('communities', 'categories', 'regions'));
    }

    public function show(Community $community)
    {
        if (!$community->isApproved() || !$community->is_public) {
            abort(404);
        }

        $community->load('category', 'owner');
        $community->loadCount('activeMembers');

        $isLoggedIn = auth()->check();
        $isMember = false;
        $isBanned = false;
        $joinCheck = null;

        if ($isLoggedIn) {
            $user = auth()->user();
            $isMember = $community->isMember($user);
            $isBanned = $community->isBanned($user);
            $joinCheck = $user->canJoinCommunity($community);
        }

        return view('guest.community-detail', compact(
            'community',
            'isLoggedIn',
            'isMember',
            'isBanned',
            'joinCheck'
        ));
    }
}
