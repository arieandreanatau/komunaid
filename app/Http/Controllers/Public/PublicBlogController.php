<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;

class PublicBlogController extends Controller
{
    public function index(Request $request)
    {
        $query = Blog::published()->with('author');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $blogs = $query->latest('published_at')->paginate(12)->withQueryString();

        $categories = Blog::published()
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return view('public.blogs.index', compact('blogs', 'categories'));
    }

    public function show(string $slug)
    {
        $blog = Blog::published()
            ->with('author')
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedBlogs = Blog::published()
            ->where('id', '!=', $blog->id)
            ->where('category', $blog->category)
            ->with('author')
            ->latest('published_at')
            ->take(3)
            ->get();

        if ($relatedBlogs->count() < 3) {
            $existingIds = $relatedBlogs->pluck('id')->push($blog->id);
            $filler = Blog::published()
                ->with('author')
                ->whereNotIn('id', $existingIds)
                ->latest('published_at')
                ->take(3 - $relatedBlogs->count())
                ->get();
            $relatedBlogs = $relatedBlogs->concat($filler);
        }

        return view('public.blogs.show', compact('blog', 'relatedBlogs'));
    }
}
