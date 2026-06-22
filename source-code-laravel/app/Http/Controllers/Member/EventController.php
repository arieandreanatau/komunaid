<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        $registrations = EventRegistration::where('user_id', auth()->id())
            ->with(['event.community'])
            ->latest()
            ->paginate(10);

        return view('member.events.index', compact('registrations'));
    }

    public function register(Event $event)
    {
        $user = auth()->user();

        $existing = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing && $existing->status !== 'cancelled') {
            return redirect()->back()->with('error', 'Anda sudah terdaftar di event ini.');
        }

        if ($existing && $existing->status === 'cancelled') {
            $existing->update(['status' => 'registered']);
            return redirect()->back()->with('success', 'Berhasil mendaftar ulang.');
        }

        if ($event->max_participants) {
            $registered = EventRegistration::where('event_id', $event->id)
                ->where('status', 'registered')
                ->count();

            if ($registered >= $event->max_participants) {
                return redirect()->back()->with('error', 'Event sudah penuh.');
            }
        }

        $paymentStatus = $event->ticket_price > 0 ? 'pending' : 'simulated';

        EventRegistration::create([
            'event_id' => $event->id,
            'user_id' => $user->id,
            'status' => 'registered',
            'payment_status' => $paymentStatus,
        ]);

        return redirect()->back()->with('success', 'Berhasil mendaftar event.');
    }

    public function cancel(Event $event)
    {
        EventRegistration::where('event_id', $event->id)
            ->where('user_id', auth()->id())
            ->update(['status' => 'cancelled']);

        return redirect()->back()->with('success', 'Berhasil membatalkan pendaftaran.');
    }
}
