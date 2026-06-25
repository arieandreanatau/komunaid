<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Models\ContactSetting;
use App\Models\Blog;
use App\Models\Suggestion;
use App\Models\HomepageSection;

class CmsController extends Controller
{
    public function index()
    {
        $stats = [
            'homepage_sections' => class_exists(HomepageSection::class) ? HomepageSection::count() : 0,
            'blogs' => class_exists(Blog::class) ? Blog::count() : 0,
            'contact_settings' => ContactSetting::count(),
            'suggestions' => Suggestion::count(),
            'cms_pages' => CmsPage::count(),
        ];

        return view('superadmin.cms.index', compact('stats'));
    }

    public function homepage()
    {
        $sections = class_exists(HomepageSection::class) ? HomepageSection::latest()->get() : collect();

        return view('superadmin.cms.homepage', compact('sections'));
    }

    public function contact()
    {
        $settings = ContactSetting::orderBy('sort_order')->get();

        return view('superadmin.cms.contact', compact('settings'));
    }

    public function blogs()
    {
        $blogs = class_exists(Blog::class) ? Blog::latest()->paginate(20) : collect();

        return view('superadmin.cms.blogs', compact('blogs'));
    }

    public function suggestions()
    {
        $suggestions = Suggestion::with('user')->latest()->paginate(20);

        return view('superadmin.cms.suggestions', compact('suggestions'));
    }
}
