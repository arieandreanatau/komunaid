<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index(Community $community)
    {
        $this->authorizeCommunity($community);
        $events = $community->events()->latest()->paginate(10);
        return view('community-owner.events.index', compact('community', 'events'));
    }

    public function create(Community $community)
    {
        $this->authorizeCommunity($community);
        return view('community-owner.events.create', compact('community'));
    }

    public function store(Request $request, Community $community)
    {
        $this->authorizeCommunity($community);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'max_participants' => 'nullable|integer|min:1',
            'ticket_price' => 'nullable|numeric|min:0',
            'is_online' => 'boolean',
            'banner' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        $validated['community_id'] = $community->id;
        $validated['created_by'] = auth()->id();
        $validated['status'] = 'pending';

        if ($request->hasFile('banner')) {
            $validated['banner'] = $request->file('banner')->store('events', 'public');
        }

        Event::create($validated);

        return redirect()->route('community-owner.communities.events.index', $community)
            ->with('success', 'Event berhasil dibuat. Menunggu approval superadmin.');
    }

    public function edit(Community $community, Event $event)
    {
        $this->authorizeCommunity($community);
        return view('community-owner.events.edit', compact('community', 'event'));
    }

    public function update(Request $request, Community $community, Event $event)
    {
        $this->authorizeCommunity($community);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'max_participants' => 'nullable|integer|min:1',
            'ticket_price' => 'nullable|numeric|min:0',
            'is_online' => 'boolean',
            'banner' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        if ($request->hasFile('banner')) {
            $validated['banner'] = $request->file('banner')->store('events', 'public');
        }

        $event->update($validated);

        return redirect()->route('community-owner.communities.events.index', $community)
            ->with('success', 'Event berhasil diupdate.');
    }

    public function destroy(Community $community, Event $event)
    {
        $this->authorizeCommunity($community);
        $event->delete();
        return redirect()->route('community-owner.communities.events.index', $community)
            ->with('success', 'Event berhasil dihapus.');
    }

    private function authorizeCommunity(Community $community): void
    {
        if ($community->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }
    }
}
