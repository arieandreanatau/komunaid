<?php

namespace App\Http\Controllers\Superadmin\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHomepageSectionRequest;
use App\Http\Requests\UpdateHomepageSectionRequest;
use App\Models\HomepageSection;

class SuperadminHomepageSectionController extends Controller
{
    public function index()
    {
        $sections = HomepageSection::orderBy('sort_order')->get();
        return view('superadmin.cms.homepage.index', compact('sections'));
    }

    public function create()
    {
        return view('superadmin.cms.homepage.create');
    }

    public function store(StoreHomepageSectionRequest $request)
    {
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
        return view('superadmin.cms.homepage.edit', compact('section'));
    }

    public function update(HomepageSection $section, UpdateHomepageSectionRequest $request)
    {
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
        $section->delete();
        return redirect()->route('superadmin.cms.homepage.index')
            ->with('success', 'Homepage section berhasil dihapus.');
    }
}
