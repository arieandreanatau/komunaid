<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Community $community)
    {
        $this->authorizeCommunity($community);
        $messages = $community->messages()->with('sender')->latest()->take(100)->get();
        return view('community-owner.messages.index', compact('community', 'messages'));
    }

    public function store(Request $request, Community $community)
    {
        $this->authorizeCommunity($community);

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $community->messages()->create([
            'sender_id' => auth()->id(),
            'content' => $validated['content'],
        ]);

        return redirect()->back()->with('success', 'Pesan berhasil dikirim.');
    }

    private function authorizeCommunity(Community $community): void
    {
        if ($community->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }
    }
}
