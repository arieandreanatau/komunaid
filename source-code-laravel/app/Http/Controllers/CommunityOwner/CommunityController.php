<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Approval;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommunityController extends Controller
{
    public function index()
    {
        $communities = auth()->user()->ownedCommunities()
            ->withCount('members')
            ->latest()
            ->paginate(10);

        return view('community-owner.communities.index', compact('communities'));
    }

    public function create()
    {
        return view('community-owner.communities.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['owner_id'] = auth()->id();
        $validated['status'] = 'pending';

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('communities', 'public');
        }
        if ($request->hasFile('banner')) {
            $validated['banner'] = $request->file('banner')->store('communities', 'public');
        }

        $community = Community::create($validated);

        Approval::create([
            'type' => 'community',
            'approvable_type' => Community::class,
            'approvable_id' => $community->id,
            'requested_by' => auth()->id(),
            'status' => 'pending',
        ]);

        return redirect()->route('community-owner.communities.index')
            ->with('success', 'Komunitas berhasil dibuat. Menunggu approval superadmin.');
    }

    public function edit(Community $community)
    {
        $this->authorize('update', $community);
        return view('community-owner.communities.edit', compact('community'));
    }

    public function update(Request $request, Community $community)
    {
        $this->authorize('update', $community);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('communities', 'public');
        }
        if ($request->hasFile('banner')) {
            $validated['banner'] = $request->file('banner')->store('communities', 'public');
        }

        $community->update($validated);

        return redirect()->route('community-owner.communities.index')
            ->with('success', 'Komunitas berhasil diupdate.');
    }

    public function destroy(Community $community)
    {
        $this->authorize('delete', $community);
        $community->delete();

        return redirect()->route('community-owner.communities.index')
            ->with('success', 'Komunitas berhasil dihapus.');
    }
}
