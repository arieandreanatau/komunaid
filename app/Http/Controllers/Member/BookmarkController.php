<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityBookmark;

class BookmarkController extends Controller
{
    public function index()
    {
        $bookmarks = CommunityBookmark::where('user_id', auth()->id())
            ->with('community.category')
            ->latest()
            ->get();

        return view('member.bookmarks.index', compact('bookmarks'));
    }

    public function store(Community $community)
    {
        if ($community->status !== 'approved' || !$community->is_public) {
            return back()->with('error', 'Hanya komunitas aktif dan publik yang bisa di-bookmark.');
        }

        $exists = CommunityBookmark::where('user_id', auth()->id())
            ->where('community_id', $community->id)
            ->exists();

        if ($exists) {
            return back()->with('error', 'Komunitas sudah di-bookmark.');
        }

        CommunityBookmark::create([
            'user_id' => auth()->id(),
            'community_id' => $community->id,
        ]);

        return back()->with('success', 'Komunitas berhasil di-bookmark.');
    }

    public function destroy(Community $community)
    {
        $bookmark = CommunityBookmark::where('user_id', auth()->id())
            ->where('community_id', $community->id)
            ->first();

        if (!$bookmark) {
            return back()->with('error', 'Bookmark tidak ditemukan.');
        }

        $bookmark->delete();

        return back()->with('success', 'Bookmark berhasil dihapus.');
    }
}
