<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventParticipantController extends Controller
{
    public function index(Event $event, Request $request)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        $query = $event->registrations()->with('user.profile');

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $registrations = $query->latest()->paginate(20)->withQueryString();

        return view('community.events.participants', compact('event', 'registrations'));
    }

    public function approve(Event $event, EventRegistration $registration)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($registration->event_id !== $event->id) {
            abort(404);
        }

        if (!in_array($registration->status, ['registered', 'pending'])) {
            return back()->with('error', 'Status pendaftaran tidak valid untuk persetujuan.');
        }

        $registration->update([
            'status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Peserta berhasil disetujui.');
    }

    public function reject(Request $request, Event $event, EventRegistration $registration)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($registration->event_id !== $event->id) {
            abort(404);
        }

        if (in_array($registration->status, ['cancelled', 'rejected'])) {
            return back()->with('error', 'Status pendaftaran tidak valid untuk penolakan.');
        }

        $registration->update([
            'status' => 'rejected',
        ]);

        return back()->with('success', 'Peserta berhasil ditolak.');
    }

    public function markAttended(Event $event, EventRegistration $registration)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($registration->event_id !== $event->id) {
            abort(404);
        }

        if (!in_array($registration->status, ['approved', 'registered'])) {
            return back()->with('error', 'Status pendaftaran tidak valid untuk menandai kehadiran.');
        }

        $registration->update([
            'status' => 'attended',
            'attendance_at' => now(),
        ]);

        return back()->with('success', 'Kehadiran peserta berhasil ditandai.');
    }

    public function cancelParticipant(Event $event, EventRegistration $registration)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($registration->event_id !== $event->id) {
            abort(404);
        }

        if ($registration->status === 'cancelled') {
            return back()->with('error', 'Peserta sudah dibatalkan sebelumnya.');
        }

        if ($registration->status === 'attended') {
            return back()->with('error', 'Tidak dapat membatalkan peserta yang sudah hadir.');
        }

        $registration->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return back()->with('success', 'Peserta berhasil dibatalkan.');
    }

    public function export(Event $event)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        $registrations = $event->registrations()
            ->with('user.profile')
            ->get();

        $filename = 'participants-' . $event->slug . '-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        return response()->stream(function () use ($registrations, $event) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['ID', 'User ID', 'Nama', 'Username', 'Email', 'Status', 'Payment Status', 'Registered At', 'Approved At', 'Attendance At']);

            foreach ($registrations as $registration) {
                fputcsv($handle, [
                    $registration->id,
                    $registration->user_id,
                    $registration->user->name ?? '-',
                    $registration->user->username ?? '-',
                    $registration->user->email ?? '-',
                    $registration->status,
                    $registration->payment_status,
                    $registration->registered_at?->format('Y-m-d H:i:s'),
                    $registration->approved_at?->format('Y-m-d H:i:s'),
                    $registration->attendance_at?->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
