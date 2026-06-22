<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityOwner\StoreEventChatRequest;
use App\Models\Event;
use App\Models\EventChat;
use App\Models\EventChatThread;
use Illuminate\Http\Request;

class EventChatController extends Controller
{
    public function index(Event $event)
    {
        $this->authorize('manageChats', $event);

        $chats = $event->chats()
            ->with('creator', 'approvedThreads.creator')
            ->latest()
            ->paginate(20);

        return view('community.events.chats', compact('event', 'chats'));
    }

    public function store(StoreEventChatRequest $request, Event $event)
    {
        $this->authorize('manageChats', $event);

        $user = auth()->user();

        $event->chats()->create([
            'created_by' => $user->id,
            'title' => $request->title,
            'message' => $request->message,
            'is_pinned' => $request->boolean('is_pinned', false),
        ]);

        return back()->with('success', 'Chat utama berhasil dibuat.');
    }

    public function show(Event $event, EventChat $chat)
    {
        $this->authorize('manageChats', $event);

        if ($chat->event_id !== $event->id) {
            abort(404);
        }

        $chat->load('creator', 'threads.creator');

        return view('community.events.chat-show', compact('event', 'chat'));
    }

    public function approveThread(Event $event, EventChat $chat, EventChatThread $thread)
    {
        $this->authorize('manageChats', $event);

        if ($chat->event_id !== $event->id || $thread->event_chat_id !== $chat->id) {
            abort(404);
        }

        $thread->update(['status' => 'approved']);

        return back()->with('success', 'Thread berhasil diapprove.');
    }

    public function rejectThread(Event $event, EventChat $chat, EventChatThread $thread)
    {
        $this->authorize('manageChats', $event);

        if ($chat->event_id !== $event->id || $thread->event_chat_id !== $chat->id) {
            abort(404);
        }

        $thread->update(['status' => 'rejected']);

        return back()->with('success', 'Thread berhasil ditolak.');
    }

    public function togglePin(Event $event, EventChat $chat)
    {
        $this->authorize('manageChats', $event);

        if ($chat->event_id !== $event->id) {
            abort(404);
        }

        $chat->update(['is_pinned' => !$chat->is_pinned]);

        return back()->with('success', $chat->is_pinned ? 'Chat berhasil dipinned.' : 'Chat berhasil unpinned.');
    }

    public function destroy(Event $event, EventChat $chat)
    {
        $this->authorize('manageChats', $event);

        if ($chat->event_id !== $event->id) {
            abort(404);
        }

        $chat->delete();

        return back()->with('success', 'Chat berhasil dihapus.');
    }
}
