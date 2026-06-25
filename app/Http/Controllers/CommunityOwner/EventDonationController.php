<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Event;
use App\Models\EventDonation;
use Illuminate\Http\Request;

class EventDonationController extends Controller
{
    public function index(Event $event, Request $request)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        $query = $event->donations();

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('donor_name', 'like', "%{$search}%")
                    ->orWhere('donor_email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $donations = $query->latest()->paginate(20)->withQueryString();

        return view('community.events.donations', compact('event', 'donations'));
    }

    public function export(Event $event)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        $donations = $event->donations()->get();

        $filename = 'donations-' . $event->slug . '-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        return response()->stream(function () use ($donations, $event) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Event ID', 'Title', 'Donor Name', 'Donor Email', 'Amount', 'Payment Method', 'Status', 'Donated At', 'Verified At']);

            foreach ($donations as $donation) {
                fputcsv($handle, [
                    $event->id,
                    $event->title,
                    $donation->donor_name,
                    $donation->donor_email,
                    $donation->amount,
                    $donation->payment_method,
                    $donation->status,
                    $donation->donated_at?->format('Y-m-d H:i:s'),
                    $donation->verified_at?->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    public function verify(Event $event, EventDonation $donation)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($donation->event_id !== $event->id) {
            abort(404);
        }

        if ($donation->status === 'verified') {
            return back()->with('error', 'Donasi sudah terverifikasi.');
        }

        if ($donation->status === 'rejected') {
            return back()->with('error', 'Donasi yang sudah ditolak tidak dapat diverifikasi.');
        }

        $donation->update([
            'status' => 'verified',
            'verified_by' => $user->id,
            'verified_at' => now(),
        ]);

        return back()->with('success', 'Donasi berhasil diverifikasi.');
    }

    public function reject(Request $request, Event $event, EventDonation $donation)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($donation->event_id !== $event->id) {
            abort(404);
        }

        if ($donation->status === 'rejected') {
            return back()->with('error', 'Donasi sudah ditolak sebelumnya.');
        }

        if ($donation->status === 'verified') {
            return back()->with('error', 'Donasi yang sudah terverifikasi tidak dapat ditolak.');
        }

        $validated = $request->validate([
            'rejected_reason' => 'required|string|max:500',
        ]);

        $donation->update([
            'status' => 'rejected',
            'rejected_reason' => $validated['rejected_reason'],
        ]);

        return back()->with('success', 'Donasi berhasil ditolak.');
    }
}
