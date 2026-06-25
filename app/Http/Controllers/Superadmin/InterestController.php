<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Interest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InterestController extends Controller
{
    public function masterDataIndex()
    {
        return view('superadmin.master-data.index');
    }

    public function index(Request $request)
    {
        $query = Interest::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $interests = $query->latest()->paginate(20);

        return view('superadmin.master-data.interests', compact('interests'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:interests,name',
            'description' => 'nullable|string|max:500',
        ]);

        Interest::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'is_active' => true,
        ]);

        return back()->with('success', 'Interest berhasil ditambahkan.');
    }

    public function update(Request $request, Interest $interest)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:interests,name,' . $interest->id,
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $interest->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? $interest->is_active,
        ]);

        return back()->with('success', 'Interest berhasil diperbarui.');
    }

    public function destroy(Interest $interest)
    {
        $interest->delete();

        return back()->with('success', 'Interest berhasil dihapus.');
    }
}
