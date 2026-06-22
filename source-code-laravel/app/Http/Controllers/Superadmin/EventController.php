<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with(['community', 'creator']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $events = $query->latest()->paginate(15);

        return view('superadmin.events.index', compact('events'));
    }

    public function approve(Event $event)
    {
        $event->update(['status' => 'approved']);
        return redirect()->back()->with('success', 'Event berhasil di-approve.');
    }

    public function reject(Event $event)
    {
        $event->update(['status' => 'rejected']);
        return redirect()->back()->with('success', 'Event berhasil ditolak.');
    }
}
