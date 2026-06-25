<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityOwner\StoreEventRequest;
use App\Http\Requests\CommunityOwner\UpdateEventRequest;
use App\Models\Community;
use App\Models\Event;
use App\Services\PlatformFeeService;
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
        $data['created_by'] = $user->id;
        $data['status'] = $data['status'] ?? 'draft';

        if ($request->hasFile('banner_path')) {
            $data['banner_path'] = $request->file('banner_path')->store('events/banners', 'public');
        }

        $event = Event::create($data);

        return redirect()->route('community.events.show', $event)
            ->with('success', 'Event berhasil dibuat!');
    }

    public function show(Event $event)
    {
        $this->authorize('view', $event);

        $event->load('community', 'registrations.user.profile', 'galleries.uploader', 'chats.creator', 'volunteerCampaigns', 'volunteers', 'donations', 'financeTransactions', 'financeSummary');

        $stats = [
            'total_registrations' => $event->registrations()->count(),
            'total_active' => $event->registrations()->where('status', 'registered')->orWhere('status', 'approved')->count(),
            'total_attended' => $event->registrations()->where('status', 'attended')->count(),
            'total_paid' => $event->registrations()->where('payment_status', 'paid')->count(),
            'total_waiting' => $event->registrations()->where('payment_status', 'waiting_confirmation')->count(),
            'total_gallery' => $event->galleries()->count(),
            'total_chats' => $event->chats()->count(),
            'total_volunteers' => $event->volunteers()->where('status', 'active')->count(),
            'total_campaigns' => $event->volunteerCampaigns()->count(),
            'total_donations' => $event->donations()->where('status', 'verified')->sum('amount'),
            'pending_donations' => $event->donations()->where('status', 'pending')->count(),
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

        if ($request->hasFile('banner_path')) {
            if ($event->banner_path) {
                Storage::disk('public')->delete($event->banner_path);
            }
            $data['banner_path'] = $request->file('banner_path')->store('events/banners', 'public');
        }

        $event->update($data);

        return redirect()->route('community.events.show', $event)
            ->with('success', 'Event berhasil diperbarui.');
    }

    public function publish(Event $event)
    {
        $this->authorize('publish', $event);

        if ($event->isPublished()) {
            return back()->with('error', 'Event sudah published.');
        }

        if ($event->isCancelled() || $event->isArchived()) {
            return back()->with('error', 'Event yang sudah dibatalkan atau diarsipkan tidak bisa dipublish.');
        }

        $event->update([
            'status' => 'published',
            'approval_status' => 'approved',
        ]);

        return back()->with('success', 'Event berhasil dipublish.');
    }

    public function cancel(Request $request, Event $event)
    {
        $this->authorize('cancel', $event);

        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        if ($event->isCancelled()) {
            return back()->with('error', 'Event sudah dibatalkan.');
        }

        $event->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'Event berhasil dibatalkan.');
    }

    public function archive(Event $event)
    {
        $this->authorize('archive', $event);

        if ($event->isArchived()) {
            return back()->with('error', 'Event sudah diarsipkan.');
        }

        $event->update([
            'status' => 'archived',
        ]);

        return back()->with('success', 'Event berhasil diarsipkan.');
    }

    public function destroy(Event $event)
    {
        $this->authorize('delete', $event);

        $event->update(['status' => 'archived']);
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

        if ($event->isPaid()) {
            $platformFeeService = app(PlatformFeeService::class);
            $platformFeeService->recordFee($confirmation);
        }

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
