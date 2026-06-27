<?php

namespace App\Http\Controllers\Superadmin\Cms;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\ContactSetting;
use App\Models\HomepageSection;
use App\Models\Suggestion;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SuperadminCmsDashboardController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('viewAny', Blog::class);

        $stats = [
            'total_blogs' => Blog::count(),
            'published_blogs' => Blog::where('status', 'published')->count(),
            'draft_blogs' => Blog::where('status', 'draft')->count(),
            'new_suggestions' => Suggestion::where('status', 'new')->count(),
            'active_sections' => HomepageSection::where('is_active', true)->count(),
            'active_contacts' => ContactSetting::where('is_active', true)->count(),
        ];

        return view('superadmin.cms.index', compact('stats'));
    }
}
