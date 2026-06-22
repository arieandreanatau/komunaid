<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityOwner\StoreSubgroupRequest;
use App\Models\Community;
use App\Models\CommunitySubgroup;
use Illuminate\Http\Request;

class SubgroupController extends Controller
{
    public function index(Community $community)
    {
        $this->authorize('manageSubgroups', $community);

        $subgroups = $community->subgroups()->with('parent')->latest()->paginate(10);

        return view('community.subgroups.index', compact('community', 'subgroups'));
    }

    public function create(Community $community)
    {
        $this->authorize('manageSubgroups', $community);

        $parentSubgroups = $community->subgroups()->whereNull('parent_id')->get();

        return view('community.subgroups.create', compact('community', 'parentSubgroups'));
    }

    public function store(StoreSubgroupRequest $request, Community $community)
    {
        $this->authorize('manageSubgroups', $community);

        $data = $request->validated();
        $data['community_id'] = $community->id;
        $data['owner_id'] = auth()->id();

        $community->subgroups()->create($data);

        return redirect()->route('community.subgroups.index', $community)
            ->with('success', 'Sub komunitas berhasil dibuat.');
    }

    public function destroy(Community $community, CommunitySubgroup $subgroup)
    {
        $this->authorize('manageSubgroups', $community);

        if ($subgroup->community_id !== $community->id) {
            abort(404);
        }

        $subgroup->delete();

        return back()->with('success', 'Sub komunitas berhasil dihapus.');
    }
}
