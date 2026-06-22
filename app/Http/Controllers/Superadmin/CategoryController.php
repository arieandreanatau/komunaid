<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\CommunityCategory;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = CommunityCategory::withCount('communities')->latest()->paginate(20);

        return view('superadmin.categories.index', compact('categories'));
    }

    public function create()
    {
        return view('superadmin.categories.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        $validated['is_active'] = $request->boolean('is_active');

        $category = CommunityCategory::create($validated);

        AuditLog::log('category_created', $category, 'Kategori dibuat: ' . $category->name);

        return redirect()->route('superadmin.categories.index')->with('success', 'Kategori berhasil dibuat.');
    }

    public function edit(CommunityCategory $category)
    {
        return view('superadmin.categories.edit', compact('category'));
    }

    public function update(Request $request, CommunityCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $old = $category->only(['name', 'description', 'icon', 'is_active']);
        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        $validated['is_active'] = $request->boolean('is_active');

        $category->update($validated);

        AuditLog::log('category_updated', $category, 'Kategori diperbarui: ' . $category->name, $old, $category->only(['name', 'description', 'icon', 'is_active']));

        return redirect()->route('superadmin.categories.index')->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(CommunityCategory $category)
    {
        $name = $category->name;
        $category->delete();

        AuditLog::log('category_deleted', $category, 'Kategori dihapus: ' . $name);

        return redirect()->route('superadmin.categories.index')->with('success', 'Kategori berhasil dihapus.');
    }
}
