<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with('community');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('community_id')) {
            $query->where('community_id', $request->community_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('location_type')) {
            $query->where('location_type', $request->location_type);
        }

        if ($request->filled('date_from')) {
            $query->where('start_datetime', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('start_datetime', '<=', $request->date_to);
        }

        $events = $query->latest()->paginate(20);

        return view('superadmin.events.index', compact('events'));
    }

    public function show(Event $event)
    {
        $event->load(['community', 'registrations.user', 'galleries', 'chats']);
        $registrationCount = $event->registrations()->where('status', 'registered')->count();

        return view('superadmin.events.show', compact('event', 'registrationCount'));
    }

    public function cancel(Request $request, Event $event)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $old = ['status' => $event->status];
        $event->update(['status' => 'cancelled']);

        AuditLog::log('event_cancelled', $event, 'Event dibatalkan: ' . $event->title . '. Alasan: ' . $request->reason, $old, ['status' => 'cancelled']);

        return back()->with('success', 'Event berhasil dibatalkan.');
    }

    public function archive(Event $event)
    {
        $old = ['status' => $event->status];
        $event->update(['status' => 'archived']);

        AuditLog::log('event_archived', $event, 'Event diarsipkan: ' . $event->title, $old, ['status' => 'archived']);

        return back()->with('success', 'Event berhasil diarsipkan.');
    }

    public function destroy(Event $event)
    {
        $old = ['status' => $event->status];
        $event->update(['status' => 'archived']);

        AuditLog::log('event_deleted', $event, 'Event dihapus (soft delete): ' . $event->title, $old, ['status' => 'archived']);

        return redirect()->route('superadmin.events.index')->with('success', 'Event berhasil dihapus.');
    }

    public function export(Request $request)
    {
        $query = Event::with('community');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $events = $query->latest()->get();

        $filename = 'komunaid_events_' . date('Ymd') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($events) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Title', 'Community', 'Start Datetime', 'End Datetime', 'Location Type', 'Status', 'Created At']);

            foreach ($events as $event) {
                fputcsv($handle, [
                    $event->id,
                    $event->title,
                    $event->community->name ?? '-',
                    $event->start_datetime?->format('Y-m-d H:i'),
                    $event->end_datetime?->format('Y-m-d H:i'),
                    $event->location_type ?? '-',
                    $event->status ?? 'draft',
                    $event->created_at?->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
