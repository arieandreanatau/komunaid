<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityOwner\StoreCommunityRequest;
use App\Http\Requests\CommunityOwner\UpdateCommunityRequest;
use App\Models\Community;
use App\Models\CommunityCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CommunityController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $communities = Community::where('owner_id', $user->id)
            ->with('category', 'activeMembers')
            ->latest()
            ->paginate(10);

        return view('community.communities.index', compact('communities'));
    }

    public function create()
    {
        $categories = CommunityCategory::where('is_active', true)->get();

        return view('community.communities.create', compact('categories'));
    }

    public function store(StoreCommunityRequest $request)
    {
        $user = auth()->user();
        $data = $request->validated();
        $data['owner_id'] = $user->id;
        $data['status'] = 'pending';

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('communities/logos', 'public');
        }

        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('communities/banners', 'public');
        }

        $community = Community::create($data);

        return redirect()->route('community.communities.show', $community)
            ->with('success', 'Komunitas berhasil dibuat! Status saat ini: Pending. Menunggu approval superadmin.');
    }

    public function show(Community $community)
    {
        $this->authorize('view', $community);

        $community->load('category', 'activeMembers.user.profile', 'regions', 'subgroups');

        $stats = [
            'total_members' => $community->activeMembers()->count(),
            'total_regions' => $community->regions()->where('status', 'active')->count(),
            'total_subgroups' => $community->subgroups()->where('status', 'active')->count(),
        ];

        return view('community.communities.show', compact('community', 'stats'));
    }

    public function edit(Community $community)
    {
        $this->authorize('update', $community);

        $categories = CommunityCategory::where('is_active', true)->get();

        return view('community.communities.edit', compact('community', 'categories'));
    }

    public function update(UpdateCommunityRequest $request, Community $community)
    {
        $this->authorize('update', $community);

        $data = $request->validated();

        if ($request->hasFile('logo')) {
            if ($community->logo) {
                Storage::disk('public')->delete($community->logo);
            }
            $data['logo'] = $request->file('logo')->store('communities/logos', 'public');
        }

        if ($request->hasFile('banner')) {
            if ($community->banner) {
                Storage::disk('public')->delete($community->banner);
            }
            $data['banner'] = $request->file('banner')->store('communities/banners', 'public');
        }

        $community->update($data);

        return redirect()->route('community.communities.show', $community)
            ->with('success', 'Komunitas berhasil diperbarui.');
    }

    public function destroy(Community $community)
    {
        $this->authorize('delete', $community);

        $community->delete();

        return redirect()->route('community.communities.index')
            ->with('success', 'Komunitas berhasil dihapus.');
    }

    public function approve(Community $community)
    {
        $this->authorize('approve', $community);

        $community->update(['status' => 'approved']);

        return back()->with('success', "Komunitas {$community->name} berhasil disetujui.");
    }

    public function reject(Community $community)
    {
        $this->authorize('approve', $community);

        $community->update(['status' => 'rejected']);

        return back()->with('success', "Komunitas {$community->name} ditolak.");
    }
}
