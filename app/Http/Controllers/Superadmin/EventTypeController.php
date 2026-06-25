<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\EventType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = EventType::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $eventTypes = $query->latest()->paginate(20);

        return view('superadmin.master-data.event-types', compact('eventTypes'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:event_types,name',
            'description' => 'nullable|string|max:500',
        ]);

        EventType::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'is_active' => true,
        ]);

        return back()->with('success', 'Event type berhasil ditambahkan.');
    }

    public function update(Request $request, EventType $eventType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:event_types,name,' . $eventType->id,
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $eventType->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? $eventType->is_active,
        ]);

        return back()->with('success', 'Event type berhasil diperbarui.');
    }

    public function destroy(EventType $eventType)
    {
        $eventType->delete();

        return back()->with('success', 'Event type berhasil dihapus.');
    }
}
