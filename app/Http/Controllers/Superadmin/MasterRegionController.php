<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\MasterRegion;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class MasterRegionController extends Controller
{
    public function index(Request $request)
    {
        $query = MasterRegion::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('province', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('province')) {
            $query->where('province', $request->province);
        }

        $regions = $query->latest()->paginate(20);
        $provinces = MasterRegion::distinct()->pluck('province')->filter()->sort()->values();

        return view('superadmin.regions.index', compact('regions', 'provinces'));
    }

    public function create()
    {
        return view('superadmin.regions.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:master_regions',
            'province' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        $validated['is_active'] = $request->boolean('is_active');

        $region = MasterRegion::create($validated);

        AuditLog::log('region_created', $region, 'Region dibuat: ' . $region->name);

        return redirect()->route('superadmin.regions.index')->with('success', 'Region berhasil dibuat.');
    }

    public function edit(MasterRegion $region)
    {
        return view('superadmin.regions.edit', compact('region'));
    }

    public function update(Request $request, MasterRegion $region)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:master_regions,code,' . $region->id,
            'province' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $old = $region->only(['name', 'code', 'province', 'description', 'is_active']);
        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        $validated['is_active'] = $request->boolean('is_active');

        $region->update($validated);

        AuditLog::log('region_updated', $region, 'Region diperbarui: ' . $region->name, $old, $region->only(['name', 'code', 'province', 'description', 'is_active']));

        return redirect()->route('superadmin.regions.index')->with('success', 'Region berhasil diperbarui.');
    }

    public function destroy(MasterRegion $region)
    {
        $name = $region->name;
        $region->delete();

        AuditLog::log('region_deleted', $region, 'Region dihapus: ' . $name);

        return redirect()->route('superadmin.regions.index')->with('success', 'Region berhasil dihapus.');
    }
}
