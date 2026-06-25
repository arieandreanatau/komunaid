<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\StoreEventRegistrationRequest;
use App\Http\Requests\Member\StorePaymentConfirmationRequest;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\EventVolunteerCampaign;
use App\Models\EventVolunteerApplication;
use App\Models\EventDonation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::where('status', 'published')
            ->where('visibility', 'public')
            ->with('community');

        if ($request->has('event_type') && $request->event_type !== '') {
            $query->where('event_type', $request->event_type);
        }
        if ($request->has('search') && $request->search !== '') {
            $keyword = $request->search;
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', "%{$keyword}%")
                  ->orWhere('description', 'like', "%{$keyword}%");
            });
        }

        $events = $query->latest()->paginate(12);

        return view('member.events.index', compact('events'));
    }

    public function show(Event $event)
    {
        $event->load('community', 'galleries', 'chats', 'volunteerCampaigns');

        $user = auth()->user();
        $registration = null;
        if ($user) {
            $registration = EventRegistration::where('event_id', $event->id)
                ->where('user_id', $user->id)
                ->with('paymentConfirmation')
                ->first();
        }

        $isCommunityMember = $user && $event->community && $event->community->isMember($user);

        $volunteerApplication = null;
        if ($user) {
            $volunteerApplication = EventVolunteerApplication::whereHas('campaign', function ($q) use ($event) {
                $q->where('event_id', $event->id);
            })->where('user_id', $user->id)->first();
        }

        return view('member.events.show', compact('event', 'registration', 'isCommunityMember', 'volunteerApplication'));
    }

    public function register(Event $event, StoreEventRegistrationRequest $request)
    {
        $user = auth()->user();

        if (!$event->isPublished()) {
            return back()->with('error', 'Event tidak tersedia untuk registrasi.');
        }

        if ($event->isCancelled() || $event->isArchived()) {
            return back()->with('error', 'Event tidak tersedia untuk registrasi.');
        }

        if (!$event->isOpenForRegistration()) {
            return back()->with('error', 'Event tidak tersedia untuk registrasi.');
        }

        if ($event->isFull()) {
            return back()->with('error', 'Event sudah penuh.');
        }

        $existing = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing && in_array($existing->status, ['registered', 'approved'])) {
            return back()->with('error', 'Anda sudah terdaftar di event ini.');
        }

        $status = $event->registration_type === 'approval_required' ? 'registered' : 'registered';

        if ($existing && $existing->status === 'cancelled') {
            $existing->update([
                'status' => $status,
                'payment_status' => $event->isPaid() ? 'unpaid' : null,
                'notes' => $request->notes,
                'registered_at' => now(),
                'cancelled_at' => null,
            ]);
        } else {
            EventRegistration::create([
                'event_id' => $event->id,
                'user_id' => $user->id,
                'status' => $status,
                'payment_status' => $event->isPaid() ? 'unpaid' : null,
                'notes' => $request->notes,
                'registered_at' => now(),
            ]);
        }

        return back()->with('success', 'Berhasil mendaftar di event ini.');
    }

    public function uploadPayment(Event $event, EventRegistration $registration, StorePaymentConfirmationRequest $request)
    {
        $user = auth()->user();

        if ($registration->user_id !== $user->id || $registration->event_id !== $event->id) {
            abort(403);
        }

        if (!$event->isPaid()) {
            return back()->with('error', 'Event ini tidak berbayar.');
        }

        if ($registration->payment_status !== 'unpaid') {
            return back()->with('error', 'Anda sudah mengunggah bukti pembayaran.');
        }

        $proofPath = $request->file('proof_image')->store('events/payments', 'public');

        $registration->paymentConfirmation()->create([
            'proof_image' => $proofPath,
            'amount_paid' => $request->amount_paid,
            'bank_name' => $request->bank_name,
            'account_name' => $request->account_name,
            'status' => 'pending',
        ]);

        $registration->update(['payment_status' => 'waiting_confirmation']);

        return back()->with('success', 'Bukti pembayaran berhasil diunggah. Menunggu konfirmasi admin.');
    }

    public function cancelRegistration(Event $event, EventRegistration $registration)
    {
        $user = auth()->user();

        if ($registration->user_id !== $user->id || $registration->event_id !== $event->id) {
            abort(403);
        }

        if (!$registration->canCancel()) {
            return back()->with('error', 'Tidak bisa membatalkan registrasi ini.');
        }

        $registration->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'payment_status' => $registration->payment_status === 'paid' ? 'cancelled' : $registration->payment_status,
        ]);

        return back()->with('success', 'Registrasi berhasil dibatalkan.');
    }

    public function myRegistrations()
    {
        $user = auth()->user();

        $registrations = EventRegistration::where('user_id', $user->id)
            ->with('event.community', 'paymentConfirmation')
            ->latest()
            ->paginate(10);

        return view('member.events.my-registrations', compact('registrations'));
    }

    public function showVolunteerApply(Event $event)
    {
        $event->load('community', 'volunteerCampaigns');

        $openCampaigns = $event->volunteerCampaigns()->where('status', 'open')->get();

        if ($openCampaigns->isEmpty()) {
            return back()->with('error', 'Tidak ada campaign volunteer yang sedang dibuka.');
        }

        $user = auth()->user();
        $existingApplication = EventVolunteerApplication::whereHas('campaign', function ($q) use ($event) {
            $q->where('event_id', $event->id);
        })->where('user_id', $user->id)
          ->whereIn('status', ['submitted', 'accepted'])
          ->first();

        if ($existingApplication) {
            return back()->with('error', 'Anda sudah mengajukan volunteer untuk event ini.');
        }

        return view('member.events.volunteer-apply', compact('event', 'openCampaigns'));
    }

    public function storeVolunteerApply(Request $request, Event $event)
    {
        $user = auth()->user();

        if (!$event->isOpenForVolunteer()) {
            return back()->with('error', 'Event tidak membuka volunteer.');
        }

        $validated = $request->validate([
            'event_volunteer_campaign_id' => 'required|exists:event_volunteer_campaigns,id',
            'position_applied' => 'nullable|string|max:255',
            'motivation' => 'nullable|string|max:2000',
            'answers' => 'nullable|string',
        ]);

        $campaign = EventVolunteerCampaign::findOrFail($validated['event_volunteer_campaign_id']);

        if ($campaign->event_id !== $event->id || $campaign->status !== 'open') {
            return back()->with('error', 'Campaign volunteer tidak tersedia.');
        }

        $existing = EventVolunteerApplication::where('event_volunteer_campaign_id', $campaign->id)
            ->where('user_id', $user->id)
            ->whereIn('status', ['submitted', 'accepted'])
            ->first();

        if ($existing) {
            return back()->with('error', 'Anda sudah mengajukan volunteer untuk campaign ini.');
        }

        EventVolunteerApplication::create([
            'event_volunteer_campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'position_applied' => $validated['position_applied'] ?? null,
            'motivation' => $validated['motivation'] ?? null,
            'answers' => $validated['answers'] ?? null,
            'status' => 'submitted',
        ]);

        return redirect()->route('member.events.show', $event)
            ->with('success', 'Berhasil mengajukan volunteer. Menunggu review.');
    }

    public function myVolunteerApplications()
    {
        $user = auth()->user();

        $applications = EventVolunteerApplication::where('user_id', $user->id)
            ->with('campaign.event.community')
            ->latest()
            ->paginate(10);

        return view('member.events.my-volunteer-applications', compact('applications'));
    }

    public function showEventDonation(Event $event)
    {
        $event->load('community');

        if (!$event->isOpenForDonation()) {
            return back()->with('error', 'Event tidak membuka donasi.');
        }

        return view('member.events.donate', compact('event'));
    }

    public function storeEventDonation(Request $request, Event $event)
    {
        if (!$event->isOpenForDonation()) {
            return back()->with('error', 'Event tidak membuka donasi.');
        }

        $validated = $request->validate([
            'donor_name' => 'nullable|string|max:255',
            'donor_email' => 'nullable|email|max:255',
            'amount' => 'required|numeric|min:1000',
            'payment_method' => 'nullable|string|max:100',
            'proof' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:4096',
            'message' => 'nullable|string|max:1000',
        ]);

        $user = auth()->user();

        $proofPath = null;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('events/donations', 'public');
        }

        EventDonation::create([
            'event_id' => $event->id,
            'donor_user_id' => $user->id,
            'donor_name' => $validated['donor_name'] ?? $user->name,
            'donor_email' => $validated['donor_email'] ?? $user->email,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'] ?? null,
            'proof_path' => $proofPath,
            'message' => $validated['message'] ?? null,
            'status' => 'pending',
            'donated_at' => now(),
        ]);

        return redirect()->route('member.events.show', $event)
            ->with('success', 'Donasi berhasil diajukan. Menunggu verifikasi.');
    }
}
