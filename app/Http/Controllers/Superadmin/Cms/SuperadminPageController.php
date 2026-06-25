<?php

namespace App\Http\Controllers\Superadmin\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCmsPageRequest;
use App\Models\CmsPage;

class SuperadminPageController extends Controller
{
    public function index()
    {
        $pages = CmsPage::orderBy('key')->get();
        return view('superadmin.cms.pages.index', compact('pages'));
    }

    public function edit(CmsPage $page)
    {
        return view('superadmin.cms.pages.edit', compact('page'));
    }

    public function update(CmsPage $page, UpdateCmsPageRequest $request)
    {
        $data = $request->validated();

        if ($data['status'] === 'published' && !$page->published_at) {
            $data['published_at'] = now();
        }
        $data['is_published'] = $data['status'] === 'published';
        $data['updated_by'] = auth()->id();

        $page->update($data);

        return redirect()->route('superadmin.cms.pages.index')
            ->with('success', 'Halaman berhasil diupdate.');
    }
}
