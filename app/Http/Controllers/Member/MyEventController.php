<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\EventRegistration;
use Illuminate\Http\Request;

class MyEventController extends Controller
{
    public function index(Request $request)
    {
        $query = EventRegistration::where('user_id', auth()->id())
            ->with('event.community')
            ->latest('registered_at');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('event', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('timing')) {
            if ($request->input('timing') === 'upcoming') {
                $query->whereHas('event', function ($q) {
                    $q->where('start_datetime', '>', now());
                });
            } elseif ($request->input('timing') === 'past') {
                $query->whereHas('event', function ($q) {
                    $q->where('start_datetime', '<=', now());
                });
            }
        }

        $registrations = $query->paginate(15);

        return view('member.events.my-index', compact('registrations'));
    }

    public function export()
    {
        $user = auth()->user();
        $registrations = EventRegistration::where('user_id', $user->id)
            ->with('event.community')
            ->latest('registered_at')
            ->get();

        $filename = 'komunaid_member_events_' . date('Ymd') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($registrations) {
            $file = fopen('php://output', 'w');

            fputcsv($file, ['Event ID', 'Title', 'Community', 'Start Datetime', 'End Datetime', 'Location Type', 'Registration Status', 'Registered At']);

            foreach ($registrations as $registration) {
                $event = $registration->event;
                fputcsv($file, [
                    $event->id ?? '-',
                    $event->title ?? '-',
                    $event->community->name ?? '-',
                    $event->start_datetime ? $event->start_datetime->format('Y-m-d H:i') : '-',
                    $event->end_datetime ? $event->end_datetime->format('Y-m-d H:i') : '-',
                    $event->location_type ?? '-',
                    $registration->status,
                    $registration->registered_at ? $registration->registered_at->format('Y-m-d H:i') : '-',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
