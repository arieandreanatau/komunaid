<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityCategory;
use Illuminate\Http\Request;

class PublicCommunityController extends Controller
{
    public function index(Request $request)
    {
        $query = Community::publicApproved()
            ->with(['category', 'owner'])
            ->withCount('activeMembers');

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

        if ($request->filled('location_type')) {
            $query->where('location_type', $request->location_type);
        }

        $sort = $request->get('sort', 'latest');
        if ($sort === 'most_members') {
            $query->orderByDesc('active_members_count');
        } elseif ($sort === 'recommended') {
            $query->recommended()->latest();
        } else {
            $query->latest();
        }

        $communities = $query->paginate(12)->withQueryString();

        $categories = CommunityCategory::where('is_active', true)->get();
        $regions = Community::publicApproved()
            ->whereNotNull('region')
            ->distinct()
            ->pluck('region');

        return view('public.communities.index', compact('communities', 'categories', 'regions'));
    }

    public function show(string $slug)
    {
        $community = Community::publicApproved()
            ->with(['category', 'owner'])
            ->withCount('activeMembers')
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedCommunities = Community::publicApproved()
            ->with(['category'])
            ->withCount('activeMembers')
            ->where('id', '!=', $community->id)
            ->where('category_id', $community->category_id)
            ->latest()
            ->take(4)
            ->get();

        return view('public.communities.show', compact('community', 'relatedCommunities'));
    }
}
