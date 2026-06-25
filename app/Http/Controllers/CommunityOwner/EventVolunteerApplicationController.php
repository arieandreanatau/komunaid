<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Event;
use App\Models\EventVolunteer;
use App\Models\EventVolunteerApplication;
use App\Models\EventVolunteerCampaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventVolunteerApplicationController extends Controller
{
    public function index(Event $event, EventVolunteerCampaign $campaign)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($campaign->event_id !== $event->id) {
            abort(404);
        }

        $applications = $campaign->applications()
            ->with('user.profile')
            ->latest()
            ->paginate(20);

        return view('community.events.volunteer-applications.index', compact('event', 'campaign', 'applications'));
    }

    public function show(Event $event, EventVolunteerCampaign $campaign, EventVolunteerApplication $application)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($campaign->event_id !== $event->id) {
            abort(404);
        }

        if ($application->event_volunteer_campaign_id !== $campaign->id) {
            abort(404);
        }

        $application->load('user.profile', 'reviewedBy');

        return view('community.events.volunteer-applications.show', compact('event', 'campaign', 'application'));
    }

    public function accept(Event $event, EventVolunteerCampaign $campaign, EventVolunteerApplication $application)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($campaign->event_id !== $event->id) {
            abort(404);
        }

        if ($application->event_volunteer_campaign_id !== $campaign->id) {
            abort(404);
        }

        if ($application->status !== 'submitted') {
            return back()->with('error', 'Lamaran tidak dalam status yang valid untuk diterima.');
        }

        DB::transaction(function () use ($application, $event, $user) {
            $application->update([
                'status' => 'accepted',
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
            ]);

            EventVolunteer::create([
                'event_id' => $event->id,
                'user_id' => $application->user_id,
                'position' => $application->position_applied,
                'status' => 'active',
                'assigned_by' => $user->id,
                'assigned_at' => now(),
            ]);
        });

        return back()->with('success', 'Lamaran volunteer berhasil diterima.');
    }

    public function reject(Request $request, Event $event, EventVolunteerCampaign $campaign, EventVolunteerApplication $application)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($campaign->event_id !== $event->id) {
            abort(404);
        }

        if ($application->event_volunteer_campaign_id !== $campaign->id) {
            abort(404);
        }

        if ($application->status !== 'submitted') {
            return back()->with('error', 'Lamaran tidak dalam status yang valid untuk ditolak.');
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $application->update([
            'status' => 'rejected',
            'reason' => $validated['reason'] ?? null,
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Lamaran volunteer berhasil ditolak.');
    }
}
