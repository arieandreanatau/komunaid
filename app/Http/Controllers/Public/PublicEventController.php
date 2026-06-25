<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class PublicEventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::where('status', 'approved')
            ->where('visibility', 'public')
            ->with('community');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('location_type')) {
            $query->where('location_type', $request->location_type);
        }

        if ($request->filled('community_id')) {
            $query->where('community_id', $request->community_id);
        }

        if ($request->filled('date_from')) {
            $query->where('start_datetime', '>=', $request->date_from);
        }

        $events = $query->orderBy('start_datetime', 'desc')->paginate(12)->withQueryString();

        return view('public.events.index', compact('events'));
    }

    public function show(string $slug)
    {
        $event = Event::where('status', 'approved')
            ->where('visibility', 'public')
            ->with('community')
            ->where('slug', $slug)
            ->firstOrFail();

        return view('public.events.show', compact('event'));
    }
}
