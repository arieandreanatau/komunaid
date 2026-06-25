<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Event;
use App\Models\EventVolunteerCampaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventVolunteerCampaignController extends Controller
{
    public function index(Event $event)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        $campaigns = $event->volunteerCampaigns()
            ->withCount('applications')
            ->latest()
            ->paginate(20);

        return view('community.events.volunteer-campaign.index', compact('event', 'campaigns'));
    }

    public function create(Event $event)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        return view('community.events.volunteer-campaign.create', compact('event'));
    }

    public function store(Request $request, Event $event)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'positions' => 'required|array|min:1',
            'positions.*' => 'string|max:255',
            'quota' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'requirements' => 'nullable|string',
        ]);

        $validated['event_id'] = $event->id;
        $validated['created_by'] = $user->id;
        $validated['status'] = 'draft';

        EventVolunteerCampaign::create($validated);

        return redirect()->route('community.events.volunteer-campaign.index', $event)
            ->with('success', 'Kampanye volunteer berhasil dibuat!');
    }

    public function edit(Event $event, EventVolunteerCampaign $campaign)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($campaign->event_id !== $event->id) {
            abort(404);
        }

        return view('community.events.volunteer-campaign.edit', compact('event', 'campaign'));
    }

    public function update(Request $request, Event $event, EventVolunteerCampaign $campaign)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($campaign->event_id !== $event->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'positions' => 'required|array|min:1',
            'positions.*' => 'string|max:255',
            'quota' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'requirements' => 'nullable|string',
        ]);

        $campaign->update($validated);

        return redirect()->route('community.events.volunteer-campaign.index', $event)
            ->with('success', 'Kampanye volunteer berhasil diperbarui.');
    }

    public function open(Event $event, EventVolunteerCampaign $campaign)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($campaign->event_id !== $event->id) {
            abort(404);
        }

        if ($campaign->status === 'open') {
            return back()->with('error', 'Kampanye sudah dalam status terbuka.');
        }

        $campaign->update(['status' => 'open']);
        $event->update(['is_open_volunteer' => true]);

        return back()->with('success', 'Kampanye volunteer berhasil dibuka.');
    }

    public function close(Event $event, EventVolunteerCampaign $campaign)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($campaign->event_id !== $event->id) {
            abort(404);
        }

        if ($campaign->status === 'closed') {
            return back()->with('error', 'Kampanye sudah dalam status tertutup.');
        }

        $campaign->update(['status' => 'closed']);

        $hasOpenCampaigns = $event->volunteerCampaigns()->where('status', 'open')->exists();
        if (!$hasOpenCampaigns) {
            $event->update(['is_open_volunteer' => false]);
        }

        return back()->with('success', 'Kampanye volunteer berhasil ditutup.');
    }

    public function destroy(Event $event, EventVolunteerCampaign $campaign)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($campaign->event_id !== $event->id) {
            abort(404);
        }

        $campaign->delete();

        return redirect()->route('community.events.volunteer-campaign.index', $event)
            ->with('success', 'Kampanye volunteer berhasil dihapus.');
    }
}
