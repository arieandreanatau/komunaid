<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\StoreChatThreadRequest;
use App\Models\Event;
use App\Models\EventChat;
use App\Models\EventChatThread;
use Illuminate\Http\Request;

class EventChatController extends Controller
{
    public function show(Event $event, EventChat $chat)
    {
        if ($chat->event_id !== $event->id) {
            abort(404);
        }

        $chat->load(['creator', 'threads' => function ($q) {
            $q->where('status', 'approved')->with('creator');
        }]);

        $user = auth()->user();
        $isMember = $event->community && $event->community->isMember($user);

        return view('member.events.chat-show', compact('event', 'chat', 'isMember'));
    }

    public function storeThread(Event $event, EventChat $chat, StoreChatThreadRequest $request)
    {
        $user = auth()->user();

        if ($chat->event_id !== $event->id) {
            abort(404);
        }

        $isMember = $event->community && $event->community->isMember($user);
        $isOwner = $event->community && $event->community->isOwnedBy($user);

        if (!$isMember && !$isOwner) {
            return back()->with('error', 'Anda harus menjadi anggota komunitas untuk memposting di chat.');
        }

        $thread = EventChatThread::create([
            'event_chat_id' => $chat->id,
            'created_by' => $user->id,
            'message' => $request->message,
            'status' => $isOwner ? 'approved' : 'pending',
        ]);

        $statusMessage = $isOwner ? 'Balasan berhasil diposting.' : 'Balasan berhasil dikirim. Menunggu approval community owner.';

        return back()->with('success', $statusMessage);
    }
}
