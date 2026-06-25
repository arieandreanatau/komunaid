<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventDonation;
use Illuminate\Http\Request;

class PublicEventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::where('status', 'published')
            ->where('visibility', 'public')
            ->with('community');

        if ($request->filled('search')) {
            $keyword = $request->search;
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', "%{$keyword}%")
                  ->orWhere('description', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->filled('location_type')) {
            $query->where('location_type', $request->location_type);
        }

        $events = $query->latest()->paginate(12);

        return view('public.events.index', compact('events'));
    }

    public function show($slug)
    {
        $event = Event::where('slug', $slug)
            ->where('status', 'published')
            ->where('visibility', 'public')
            ->with('community', 'type')
            ->firstOrFail();

        $totalDonated = EventDonation::where('event_id', $event->id)
            ->where('status', 'verified')
            ->sum('amount');

        $donationCount = EventDonation::where('event_id', $event->id)
            ->where('status', 'verified')
            ->count();

        $relatedEvents = Event::where('community_id', $event->community_id)
            ->where('id', '!=', $event->id)
            ->where('status', 'published')
            ->latest()
            ->take(3)
            ->get();

        return view('public.events.show', compact('event', 'totalDonated', 'donationCount', 'relatedEvents'));
    }
}