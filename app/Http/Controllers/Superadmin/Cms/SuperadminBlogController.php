<?php

namespace App\Http\Controllers\Superadmin\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SuperadminBlogController extends Controller
{
    public function index(Request $request)
    {
        $query = Blog::with('author');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $blogs = $query->latest()->paginate(15)->withQueryString();

        return view('superadmin.cms.blogs.index', compact('blogs'));
    }

    public function create()
    {
        return view('superadmin.cms.blogs.create');
    }

    public function store(StoreBlogRequest $request)
    {
        $data = $request->validated();
        $data['author_id'] = auth()->id();
        $data['slug'] = $data['slug'] ?: Str::slug($data['title']);

        if ($request->hasFile('cover')) {
            $data['cover_path'] = $request->file('cover')->store('blogs', 'public');
        }

        if (is_string($data['tags'] ?? null)) {
            $data['tags'] = array_map('trim', explode(',', $data['tags']));
        }

        if ($data['status'] === 'published') {
            $data['published_at'] = now();
        }

        Blog::create($data);

        return redirect()->route('superadmin.cms.blogs.index')
            ->with('success', 'Blog berhasil ditambahkan.');
    }

    public function edit(Blog $blog)
    {
        return view('superadmin.cms.blogs.edit', compact('blog'));
    }

    public function update(Blog $blog, UpdateBlogRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?: Str::slug($data['title']);

        if ($request->hasFile('cover')) {
            $data['cover_path'] = $request->file('cover')->store('blogs', 'public');
        }

        if (is_string($data['tags'] ?? null)) {
            $data['tags'] = array_map('trim', explode(',', $data['tags']));
        }

        if ($data['status'] === 'published' && !$blog->published_at) {
            $data['published_at'] = now();
        }

        $blog->update($data);

        return redirect()->route('superadmin.cms.blogs.index')
            ->with('success', 'Blog berhasil diupdate.');
    }

    public function destroy(Blog $blog)
    {
        $blog->delete();
        return redirect()->route('superadmin.cms.blogs.index')
            ->with('success', 'Blog berhasil dihapus.');
    }

    public function publish(Blog $blog)
    {
        $blog->update([
            'status' => 'published',
            'published_at' => $blog->published_at ?? now(),
        ]);

        return redirect()->route('superadmin.cms.blogs.index')
            ->with('success', 'Blog berhasil dipublish.');
    }

    public function archive(Blog $blog)
    {
        $blog->update(['status' => 'archived']);

        return redirect()->route('superadmin.cms.blogs.index')
            ->with('success', 'Blog berhasil diarsipkan.');
    }
}
