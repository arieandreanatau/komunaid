<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Event;
use App\Models\EventVolunteer;
use Illuminate\Http\Request;

class EventVolunteerController extends Controller
{
    public function index(Event $event, Request $request)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        $query = $event->volunteers()->with('user.profile', 'assignedBy');

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $volunteers = $query->latest()->paginate(20)->withQueryString();

        return view('community.events.volunteers', compact('event', 'volunteers'));
    }

    public function export(Event $event)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        $volunteers = $event->volunteers()->with('user')->get();

        $filename = 'volunteers-' . $event->slug . '-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        return response()->stream(function () use ($volunteers, $event) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Event ID', 'Title', 'User ID', 'Name', 'Username', 'Email', 'Position', 'Status', 'Assigned At']);

            foreach ($volunteers as $volunteer) {
                fputcsv($handle, [
                    $event->id,
                    $event->title,
                    $volunteer->user_id,
                    $volunteer->user->name ?? '-',
                    $volunteer->user->username ?? '-',
                    $volunteer->user->email ?? '-',
                    $volunteer->position,
                    $volunteer->status,
                    $volunteer->assigned_at?->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    public function activate(Event $event, EventVolunteer $volunteer)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($volunteer->event_id !== $event->id) {
            abort(404);
        }

        if ($volunteer->status === 'active') {
            return back()->with('error', 'Volunteer sudah dalam status aktif.');
        }

        $volunteer->update(['status' => 'active']);

        return back()->with('success', 'Volunteer berhasil diaktifkan.');
    }

    public function deactivate(Event $event, EventVolunteer $volunteer)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($volunteer->event_id !== $event->id) {
            abort(404);
        }

        if ($volunteer->status === 'inactive') {
            return back()->with('error', 'Volunteer sudah dalam status tidak aktif.');
        }

        $volunteer->update(['status' => 'inactive']);

        return back()->with('success', 'Volunteer berhasil dinonaktifkan.');
    }

    public function destroy(Event $event, EventVolunteer $volunteer)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($volunteer->event_id !== $event->id) {
            abort(404);
        }

        $volunteer->delete();

        return redirect()->route('community.events.volunteers.index', $event)
            ->with('success', 'Volunteer berhasil dihapus.');
    }
}
