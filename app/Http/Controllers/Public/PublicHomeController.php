<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Community;
use App\Models\ContactSetting;
use App\Models\Event;
use App\Models\HomepageSection;

class PublicHomeController extends Controller
{
    public function index()
    {
        $sections = HomepageSection::active()
            ->language(app()->getLocale())
            ->get()
            ->keyBy('key');

        if ($sections->isEmpty()) {
            $sections = HomepageSection::active()->get()->keyBy('key');
        }

        $recommendedCommunities = Community::publicApproved()
            ->recommended()
            ->with(['category', 'owner'])
            ->withCount('activeMembers')
            ->latest()
            ->take(6)
            ->get();

        if ($recommendedCommunities->count() < 6) {
            $existingIds = $recommendedCommunities->pluck('id');
            $filler = Community::publicApproved()
                ->with(['category', 'owner'])
                ->withCount('activeMembers')
                ->whereNotIn('id', $existingIds)
                ->latest()
                ->take(6 - $recommendedCommunities->count())
                ->get();
            $recommendedCommunities = $recommendedCommunities->concat($filler);
        }

        $upcomingEvents = Event::where('status', 'approved')
            ->where('visibility', 'public')
            ->with('community')
            ->where('start_datetime', '>=', now())
            ->orderBy('start_datetime')
            ->take(6)
            ->get();

        $latestBlogs = Blog::published()
            ->with('author')
            ->latest('published_at')
            ->take(3)
            ->get();

        $contactSettings = ContactSetting::active()
            ->orderBy('sort_order')
            ->get();

        return view('public.home', compact(
            'sections',
            'recommendedCommunities',
            'upcomingEvents',
            'latestBlogs',
            'contactSettings'
        ));
    }
}
