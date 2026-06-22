<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Community $community)
    {
        $this->authorizeCommunity($community);
        $posts = $community->posts()->with('user')->latest()->paginate(15);
        return view('community-owner.posts.index', compact('community', 'posts'));
    }

    public function store(Request $request, Community $community)
    {
        $this->authorizeCommunity($community);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'type' => 'in:announcement,discussion,general',
            'is_pinned' => 'boolean',
        ]);

        $validated['community_id'] = $community->id;
        $validated['user_id'] = auth()->id();

        Post::create($validated);

        return redirect()->back()->with('success', 'Post berhasil dibuat.');
    }

    public function destroy(Community $community, Post $post)
    {
        $this->authorizeCommunity($community);
        $post->delete();
        return redirect()->back()->with('success', 'Post berhasil dihapus.');
    }

    private function authorizeCommunity(Community $community): void
    {
        if ($community->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }
    }
}
