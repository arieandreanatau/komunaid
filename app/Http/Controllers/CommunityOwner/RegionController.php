<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityOwner\StoreRegionRequest;
use App\Models\Community;
use App\Models\CommunityRegion;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    public function index(Community $community)
    {
        $this->authorize('manageRegions', $community);

        $regions = $community->regions()->latest()->paginate(10);

        return view('community.regions.index', compact('community', 'regions'));
    }

    public function create(Community $community)
    {
        $this->authorize('manageRegions', $community);

        return view('community.regions.create', compact('community'));
    }

    public function store(StoreRegionRequest $request, Community $community)
    {
        $this->authorize('manageRegions', $community);

        $data = $request->validated();
        $data['community_id'] = $community->id;
        $data['owner_id'] = auth()->id();

        $community->regions()->create($data);

        return redirect()->route('community.regions.index', $community)
            ->with('success', 'Regional komunitas berhasil dibuat.');
    }

    public function show(Community $community, CommunityRegion $region)
    {
        $this->authorize('manageRegions', $community);

        if ($region->community_id !== $community->id) {
            abort(404);
        }

        return view('community.regions.show', compact('community', 'region'));
    }

    public function destroy(Community $community, CommunityRegion $region)
    {
        $this->authorize('manageRegions', $community);

        if ($region->community_id !== $community->id) {
            abort(404);
        }

        $region->delete();

        return back()->with('success', 'Regional komunitas berhasil dihapus.');
    }
}
