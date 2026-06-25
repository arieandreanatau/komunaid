<?php

namespace App\Http\Controllers\Superadmin\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHomepageSectionRequest;
use App\Http\Requests\UpdateHomepageSectionRequest;
use App\Models\HomepageSection;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SuperadminHomepageSectionController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('viewAny', HomepageSection::class);

        $sections = HomepageSection::orderBy('sort_order')->get();
        return view('superadmin.cms.homepage.index', compact('sections'));
    }

    public function create()
    {
        $this->authorize('create', HomepageSection::class);
        return view('superadmin.cms.homepage.create');
    }

    public function store(StoreHomepageSectionRequest $request)
    {
        $this->authorize('create', HomepageSection::class);

        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active');

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('homepage', 'public');
        }

        HomepageSection::create($data);

        return redirect()->route('superadmin.cms.homepage.index')
            ->with('success', 'Homepage section berhasil ditambahkan.');
    }

    public function edit(HomepageSection $section)
    {
        $this->authorize('update', $section);
        return view('superadmin.cms.homepage.edit', compact('section'));
    }

    public function update(HomepageSection $section, UpdateHomepageSectionRequest $request)
    {
        $this->authorize('update', $section);

        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active');

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('homepage', 'public');
        }

        $section->update($data);

        return redirect()->route('superadmin.cms.homepage.index')
            ->with('success', 'Homepage section berhasil diupdate.');
    }

    public function destroy(HomepageSection $section)
    {
        $this->authorize('delete', $section);

        $section->delete();
        return redirect()->route('superadmin.cms.homepage.index')
            ->with('success', 'Homepage section berhasil dihapus.');
    }
}
