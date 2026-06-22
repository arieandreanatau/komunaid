<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityOwner\StoreEventGalleryRequest;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventGalleryController extends Controller
{
    public function index(Event $event)
    {
        $this->authorize('manageGalleries', $event);

        $galleries = $event->galleries()
            ->with('uploader')
            ->latest()
            ->paginate(20);

        return view('community.events.galleries', compact('event', 'galleries'));
    }

    public function store(StoreEventGalleryRequest $request, Event $event)
    {
        $this->authorize('manageGalleries', $event);

        $user = auth()->user();

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('events/galleries', 'public');
                $caption = $request->input("captions.{$index}");

                $event->galleries()->create([
                    'uploaded_by' => $user->id,
                    'image_path' => $path,
                    'caption' => $caption,
                ]);
            }
        }

        return back()->with('success', 'Gallery berhasil diupload.');
    }

    public function destroy(Event $event, \App\Models\EventGallery $gallery)
    {
        $this->authorize('manageGalleries', $event);

        if ($gallery->event_id !== $event->id) {
            abort(404);
        }

        if ($gallery->image_path) {
            Storage::disk('public')->delete($gallery->image_path);
        }

        $gallery->delete();

        return back()->with('success', 'Gallery berhasil dihapus.');
    }
}
