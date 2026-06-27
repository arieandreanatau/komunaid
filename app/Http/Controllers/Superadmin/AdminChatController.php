<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Superadmin\StoreAdminConversationRequest;
use App\Http\Requests\Superadmin\StoreAdminMessageRequest;
use App\Http\Requests\Superadmin\AddAdminConversationParticipantRequest;
use App\Http\Requests\Superadmin\SearchAdminChatRequest;
use App\Models\AdminConversation;
use App\Models\AdminConversationParticipant;
use App\Models\User;
use App\Services\AdminChat\AdminChatService;
use Illuminate\Support\Facades\Auth;

class AdminChatController extends Controller
{
    protected AdminChatService $chatService;

    public function __construct(AdminChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    public function index()
    {
        $user = Auth::user();
        $status = request('status');
        $search = request('search');

        $conversations = $this->chatService->getConversationsForUser($user, [
            'status' => $status,
            'search' => $search,
        ])->paginate(20);

        $unreadCounts = [];
        foreach ($conversations as $conv) {
            $unreadCounts[$conv->id] = $this->chatService->unreadCountForConversation($conv, $user);
        }

        return view('superadmin.admin-chat.index', compact('conversations', 'unreadCounts', 'status', 'search'));
    }

    public function create()
    {
        $users = User::where('status', 'active')
            ->where('id', '!=', Auth::id())
            ->where(function ($q) {
                $q->whereHas('roles', fn($r) => $r->where('name', 'superadmin'))
                    ->orWhereHas('roles', fn($r) => $r->where('name', 'platform_admin'));
            })
            ->whereDoesntHave('roles', fn($r) => $r->whereIn('name', ['banned', 'suspended']))
            ->orderBy('name')
            ->get();

        return view('superadmin.admin-chat.create', compact('users'));
    }

    public function store(StoreAdminConversationRequest $request)
    {
        $conversation = $this->chatService->createConversation(
            Auth::user(),
            $request->participant_ids,
            $request->first_message,
            $request->title
        );

        return redirect()->route('superadmin.admin-chat.show', $conversation)
            ->with('success', 'Percakapan baru berhasil dibuat.');
    }

    public function show(AdminConversation $conversation)
    {
        $user = Auth::user();
        $this->chatService->ensureParticipant($conversation, $user);

        $conversation->load(['participants.user', 'latestMessage.sender']);

        $this->chatService->markAsRead($conversation, $user);

        $messages = $conversation->messages()
            ->with('sender')
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        $unreadCount = $this->chatService->unreadCountForConversation($conversation, $user);

        $participantIds = $conversation->participants
            ->whereNull('deleted_at')
            ->pluck('user_id')
            ->toArray();

        $canManage = $this->canManageParticipants($conversation, $user);

        $allAdmins = User::where('status', 'active')
            ->where(function ($q) {
                $q->whereHas('roles', fn($r) => $r->where('name', 'superadmin'))
                    ->orWhereHas('roles', fn($r) => $r->where('name', 'platform_admin'));
            })
            ->whereDoesntHave('roles', fn($r) => $r->whereIn('name', ['banned', 'suspended']))
            ->whereNotIn('id', $participantIds)
            ->orderBy('name')
            ->get();

        return view('superadmin.admin-chat.show', compact(
            'conversation',
            'messages',
            'unreadCount',
            'canManage',
            'allAdmins'
        ));
    }

    public function storeMessage(AdminConversation $conversation, StoreAdminMessageRequest $request)
    {
        $user = Auth::user();
        $this->chatService->ensureParticipant($conversation, $user);

        $this->chatService->sendMessage($conversation, $user, $request->body);

        return redirect()->route('superadmin.admin-chat.show', $conversation)
            ->with('success', 'Pesan berhasil dikirim.');
    }

    public function read(AdminConversation $conversation)
    {
        $user = Auth::user();
        $this->chatService->ensureParticipant($conversation, $user);

        $this->chatService->markAsRead($conversation, $user);

        return redirect()->back();
    }

    public function archive(AdminConversation $conversation)
    {
        $user = Auth::user();
        $this->chatService->archiveForUser($conversation, $user);

        return redirect()->route('superadmin.admin-chat.index')
            ->with('success', 'Percakapan berhasil diarsipkan.');
    }

    public function unarchive(AdminConversation $conversation)
    {
        $user = Auth::user();
        $this->chatService->unarchiveForUser($conversation, $user);

        return redirect()->route('superadmin.admin-chat.index')
            ->with('success', 'Percakapan berhasil dipulihkan dari arsip.');
    }

    public function addParticipant(AdminConversation $conversation, AddAdminConversationParticipantRequest $request)
    {
        $actor = Auth::user();
        $target = User::findOrFail($request->user_id);

        $this->chatService->addParticipant($conversation, $actor, $target);

        return redirect()->route('superadmin.admin-chat.show', $conversation)
            ->with('success', "{$target->name} berhasil ditambahkan ke percakapan.");
    }

    public function removeParticipant(AdminConversation $conversation, AdminConversationParticipant $participant)
    {
        $actor = Auth::user();

        $this->chatService->removeParticipant($conversation, $actor, $participant);

        return redirect()->route('superadmin.admin-chat.show', $conversation)
            ->with('success', 'Peserta berhasil dihapus dari percakapan.');
    }

    public function search(SearchAdminChatRequest $request)
    {
        $user = Auth::user();
        $keyword = $request->q;
        $status = request('status');

        $conversations = $this->chatService->getConversationsForUser($user, [
            'search' => $keyword,
            'status' => $status,
        ])->paginate(20);

        $unreadCounts = [];
        foreach ($conversations as $conv) {
            $unreadCounts[$conv->id] = $this->chatService->unreadCountForConversation($conv, $user);
        }

        return view('superadmin.admin-chat.index', compact('conversations', 'unreadCounts', 'keyword', 'status'))
            ->with('search', $keyword);
    }

    private function canManageParticipants(AdminConversation $conversation, User $user): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        $participant = AdminConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->where('role', 'owner')
            ->whereNull('deleted_at')
            ->exists();

        return $participant;
    }
}
