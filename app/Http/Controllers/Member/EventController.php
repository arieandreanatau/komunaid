<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\StoreEventRegistrationRequest;
use App\Http\Requests\Member\StorePaymentConfirmationRequest;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::where('approval_status', 'approved')
            ->where('visibility', 'public')
            ->with('community');

        if ($request->has('event_type') && $request->event_type !== '') {
            $query->where('event_type', $request->event_type);
        }
        if ($request->has('search') && $request->search !== '') {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $events = $query->latest()->paginate(12);

        return view('member.events.index', compact('events'));
    }

    public function show(Event $event)
    {
        $event->load('community', 'galleries', 'chats');

        $user = auth()->user();
        $registration = null;
        if ($user) {
            $registration = EventRegistration::where('event_id', $event->id)
                ->where('user_id', $user->id)
                ->with('paymentConfirmation')
                ->first();
        }

        $isCommunityMember = $user && $event->community && $event->community->isMember($user);

        return view('member.events.show', compact('event', 'registration', 'isCommunityMember'));
    }

    public function register(Event $event, StoreEventRegistrationRequest $request)
    {
        $user = auth()->user();

        if (!$event->isOpenForRegistration()) {
            return back()->with('error', 'Event tidak tersedia untuk registrasi.');
        }

        if ($event->isFull()) {
            return back()->with('error', 'Event sudah penuh.');
        }

        $existing = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing && $existing->status === 'registered') {
            return back()->with('error', 'Anda sudah terdaftar di event ini.');
        }

        if ($existing && $existing->status === 'cancelled') {
            $existing->update([
                'status' => 'registered',
                'payment_status' => $event->isPaid() ? 'unpaid' : null,
                'notes' => $request->notes,
                'registered_at' => now(),
            ]);
        } else {
            EventRegistration::create([
                'event_id' => $event->id,
                'user_id' => $user->id,
                'status' => 'registered',
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
}
