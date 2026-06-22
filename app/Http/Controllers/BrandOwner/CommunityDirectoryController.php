<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;

class CommunityDirectoryController extends Controller
{
    public function index()
    {
        $communities = Community::where('status', 'approved')
            ->with('category', 'activeMembers')
            ->latest()
            ->paginate(12);

        return view('brand.community-directory.index', compact('communities'));
    }

    public function show(Community $community)
    {
        if (!$community->isApproved()) {
            abort(404);
        }

        $community->load('category', 'activeMembers', 'regions', 'subgroups');

        $stats = [
            'total_members' => $community->activeMembers()->count(),
            'total_regions' => $community->regions()->where('status', 'active')->count(),
        ];

        return view('brand.community-directory.show', compact('community', 'stats'));
    }
}
