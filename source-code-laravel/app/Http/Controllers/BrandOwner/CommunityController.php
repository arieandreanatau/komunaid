<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;

class CommunityController extends Controller
{
    public function index()
    {
        $communities = Community::where('status', 'approved')
            ->where('is_public', true)
            ->withCount(['members' => function ($q) {
                $q->wherePivot('status', 'approved');
            }])
            ->latest()
            ->paginate(12);

        return view('brand-owner.communities.index', compact('communities'));
    }

    public function show(Community $community)
    {
        if ($community->status !== 'approved') {
            abort(404);
        }

        $stats = [
            'total_members' => $community->approvedMembersCount(),
            'total_events' => $community->events()->where('status', 'approved')->count(),
        ];

        return view('brand-owner.communities.show', compact('community', 'stats'));
    }
}
