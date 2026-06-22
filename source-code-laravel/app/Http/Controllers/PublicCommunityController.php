<?php

namespace App\Http\Controllers;

use App\Models\Community;
use Illuminate\Http\Request;

class PublicCommunityController extends Controller
{
    public function index(Request $request)
    {
        $query = Community::where('status', 'approved')
            ->where('is_public', true)
            ->withCount('members');

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhere('location', 'like', "%{$request->search}%");
            });
        }

        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        $communities = $query->orderByDesc('members_count')->paginate(12);

        return view('landing.communities', compact('communities'));
    }

    public function show(string $slug)
    {
        $community = Community::where('slug', $slug)
            ->where('status', 'approved')
            ->withCount(['members as approved_members_count' => function ($q) {
                $q->where('community_members.status', 'approved');
            }])
            ->withCount('events')
            ->with(['owner', 'events' => function ($q) {
                $q->where('status', 'approved')
                  ->where('start_date', '>', now())
                  ->orderBy('start_date')
                  ->take(5);
            }])
            ->firstOrFail();

        return view('landing.community-detail', compact('community'));
    }
}
