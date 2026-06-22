<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityOwner\StoreEventRequest;
use App\Http\Requests\CommunityOwner\UpdateEventRequest;
use App\Models\Community;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        $query = Event::whereIn('community_id', $communityIds)->with('community');

        if ($request->has('status') && $request->status !== '') {
            $query->where('approval_status', $request->status);
        }
        if ($request->has('event_type') && $request->event_type !== '') {
            $query->where('event_type', $request->event_type);
        }

        $events = $query->latest()->paginate(10);

        return view('community.events.index', compact('events'));
    }

    public function create()
    {
        $user = auth()->user();
        $communities = Community::where('owner_id', $user->id)
            ->where('status', 'approved')
            ->get();

        return view('community.events.create', compact('communities'));
    }

    public function store(StoreEventRequest $request)
    {
        $user = auth()->user();
        $community = Community::where('id', $request->community_id)
            ->where('owner_id', $user->id)
            ->first();

        if (!$community) {
            return back()->with('error', 'Komunitas tidak ditemukan atau bukan milik Anda.');
        }

        $data = $request->validated();
        $data['approval_status'] = 'approved';
        $data['slug'] = \Illuminate\Support\Str::slug($request->title);

        $event = Event::create($data);

        return redirect()->route('community.events.show', $event)
            ->with('success', 'Event berhasil dibuat!');
    }

    public function show(Event $event)
    {
        $this->authorize('view', $event);

        $event->load('community', 'registrations.user.profile', 'galleries.uploader', 'chats.creator');

        $stats = [
            'total_registrations' => $event->registrations()->where('status', 'registered')->count(),
            'total_paid' => $event->registrations()->where('payment_status', 'paid')->count(),
            'total_waiting' => $event->registrations()->where('payment_status', 'waiting_confirmation')->count(),
            'total_gallery' => $event->galleries()->count(),
            'total_chats' => $event->chats()->count(),
        ];

        return view('community.events.show', compact('event', 'stats'));
    }

    public function edit(Event $event)
    {
        $this->authorize('update', $event);

        $user = auth()->user();
        $communities = Community::where('owner_id', $user->id)
            ->where('status', 'approved')
            ->get();

        return view('community.events.edit', compact('event', 'communities'));
    }

    public function update(UpdateEventRequest $request, Event $event)
    {
        $this->authorize('update', $event);

        $data = $request->validated();
        $event->update($data);

        return redirect()->route('community.events.show', $event)
            ->with('success', 'Event berhasil diperbarui.');
    }

    public function destroy(Event $event)
    {
        $this->authorize('delete', $event);

        $event->delete();

        return redirect()->route('community.events.index')
            ->with('success', 'Event berhasil dihapus.');
    }

    public function registrations(Event $event)
    {
        $this->authorize('manageRegistrations', $event);

        $registrations = $event->registrations()
            ->with('user.profile', 'paymentConfirmation')
            ->latest()
            ->paginate(20);

        return view('community.events.registrations', compact('event', 'registrations'));
    }

    public function confirmPayment(Event $event, \App\Models\EventRegistration $registration)
    {
        $this->authorize('manageRegistrations', $event);

        if ($registration->event_id !== $event->id) {
            abort(404);
        }

        $confirmation = $registration->paymentConfirmation;
        if (!$confirmation || $confirmation->status !== 'pending') {
            return back()->with('error', 'Tidak ada pembayaran yang menunggu konfirmasi.');
        }

        $confirmation->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        $registration->update(['payment_status' => 'paid']);

        return back()->with('success', 'Pembayaran berhasil dikonfirmasi.');
    }

    public function rejectPayment(Event $event, \App\Models\EventRegistration $registration)
    {
        $this->authorize('manageRegistrations', $event);

        if ($registration->event_id !== $event->id) {
            abort(404);
        }

        $confirmation = $registration->paymentConfirmation;
        if (!$confirmation || $confirmation->status !== 'pending') {
            return back()->with('error', 'Tidak ada pembayaran yang menunggu konfirmasi.');
        }

        $confirmation->update([
            'status' => 'rejected',
            'admin_notes' => request('admin_notes', 'Pembayaran ditolak.'),
        ]);

        $registration->update(['payment_status' => 'rejected']);

        return back()->with('success', 'Pembayaran ditolak.');
    }
}
