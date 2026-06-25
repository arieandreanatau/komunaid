<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\StoreMemberGalleryRequest;
use App\Http\Requests\Member\UpdateMemberGalleryRequest;
use App\Models\MemberGallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    public function index()
    {
        $galleries = MemberGallery::where('user_id', auth()->id())
            ->with('community', 'event')
            ->latest()
            ->paginate(12);

        return view('member.gallery.index', compact('galleries'));
    }

    public function create()
    {
        $user = auth()->user();
        $communities = $user->joinedCommunities()->get();
        $events = $user->eventRegistrations()->with('event')->get()->pluck('event')->filter();

        return view('member.gallery.create', compact('communities', 'events'));
    }

    public function store(StoreMemberGalleryRequest $request)
    {
        try {
            $data = $request->validated();
            $data['user_id'] = auth()->id();

            if ($request->hasFile('image')) {
                $data['image_path'] = $request->file('image')->store('member-galleries', 'public');
            }

            MemberGallery::create($data);

            return redirect()->route('member.galleries.index')->with('success', 'Galeri berhasil diunggah.');
        } catch (\Exception $e) {
            return back()->withInput()->with('error', 'Gagal mengunggah galeri: ' . $e->getMessage());
        }
    }

    public function edit(MemberGallery $gallery)
    {
        if ($gallery->user_id !== auth()->id()) {
            abort(403);
        }

        $user = auth()->user();
        $communities = $user->joinedCommunities()->get();
        $events = $user->eventRegistrations()->with('event')->get()->pluck('event')->filter();

        return view('member.gallery.edit', compact('gallery', 'communities', 'events'));
    }

    public function update(UpdateMemberGalleryRequest $request, MemberGallery $gallery)
    {
        if ($gallery->user_id !== auth()->id()) {
            abort(403);
        }

        try {
            $data = $request->validated();

            if ($request->hasFile('image')) {
                if ($gallery->image_path) {
                    Storage::disk('public')->delete($gallery->image_path);
                }
                $data['image_path'] = $request->file('image')->store('member-galleries', 'public');
            }

            $gallery->update($data);

            return redirect()->route('member.galleries.index')->with('success', 'Galeri berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->withInput()->with('error', 'Gagal memperbarui galeri: ' . $e->getMessage());
        }
    }

    public function destroy(MemberGallery $gallery)
    {
        if ($gallery->user_id !== auth()->id()) {
            abort(403);
        }

        try {
            if ($gallery->image_path) {
                Storage::disk('public')->delete($gallery->image_path);
            }

            $gallery->delete();

            return redirect()->route('member.galleries.index')->with('success', 'Galeri berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus galeri: ' . $e->getMessage());
        }
    }
}
