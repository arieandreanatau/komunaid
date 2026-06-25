<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Friendship;
use App\Models\MemberHistory;
use App\Models\User;
use Illuminate\Http\Request;

class FriendController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $friends = Friendship::where(function ($q) use ($userId) {
                $q->where('requester_id', $userId)->orWhere('addressee_id', $userId);
            })
            ->where('status', 'accepted')
            ->with(['requester.profile', 'addressee.profile'])
            ->latest('responded_at')
            ->get();

        $incomingRequests = Friendship::where('addressee_id', $userId)
            ->where('status', 'pending')
            ->with('requester.profile')
            ->latest('requested_at')
            ->get();

        $outgoingRequests = Friendship::where('requester_id', $userId)
            ->where('status', 'pending')
            ->with('addressee.profile')
            ->latest('requested_at')
            ->get();

        return view('member.friends.index', compact('friends', 'incomingRequests', 'outgoingRequests'));
    }

    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2',
        ]);

        $search = $request->input('q');
        $userId = auth()->id();

        $users = User::where('id', '!=', $userId)
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('profile', function ($pq) use ($search) {
                        $pq->where('username', 'like', "%{$search}%")
                            ->orWhere('display_name', 'like', "%{$search}%");
                    });
            })
            ->with('profile')
            ->limit(20)
            ->get();

        return view('member.friends.search', compact('users', 'search'));
    }

    public function request(User $user)
    {
        $currentUser = auth()->user();

        if ($user->id === $currentUser->id) {
            return back()->with('error', 'Tidak dapat menambahkan diri sendiri.');
        }

        $existing = Friendship::where(function ($q) use ($currentUser, $user) {
            $q->where(['requester_id' => $currentUser->id, 'addressee_id' => $user->id])
                ->orWhere(['requester_id' => $user->id, 'addressee_id' => $currentUser->id]);
        })->where('status', 'pending')->first();

        if ($existing) {
            return back()->with('error', 'Pertemanan sudah menunggu persetujuan.');
        }

        $alreadyFriends = Friendship::where(function ($q) use ($currentUser, $user) {
            $q->where(['requester_id' => $currentUser->id, 'addressee_id' => $user->id])
                ->orWhere(['requester_id' => $user->id, 'addressee_id' => $currentUser->id]);
        })->where('status', 'accepted')->first();

        if ($alreadyFriends) {
            return back()->with('error', 'Anda sudah berteman dengan pengguna ini.');
        }

        Friendship::create([
            'requester_id' => $currentUser->id,
            'addressee_id' => $user->id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        MemberHistory::create([
            'user_id' => $currentUser->id,
            'type' => 'friend_request_sent',
            'title' => 'Permintaan pertemanan dikirim',
            'description' => 'Permintaan pertemanan dikirim ke ' . $user->name,
            'reference_type' => User::class,
            'reference_id' => $user->id,
        ]);

        return back()->with('success', 'Permintaan pertemanan berhasil dikirim.');
    }

    public function accept(Friendship $friendship)
    {
        $userId = auth()->id();

        if ($friendship->addressee_id !== $userId) {
            abort(403);
        }

        if ($friendship->status !== 'pending') {
            return back()->with('error', 'Permintaan pertemanan sudah diproses.');
        }

        $friendship->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);

        MemberHistory::create([
            'user_id' => $userId,
            'type' => 'friend_request_accepted',
            'title' => 'Permintaan pertemanan diterima',
            'description' => 'Pertemanan diterima dengan ' . $friendship->requester->name,
            'reference_type' => User::class,
            'reference_id' => $friendship->requester_id,
        ]);

        return back()->with('success', 'Permintaan pertemanan berhasil diterima.');
    }

    public function reject(Friendship $friendship)
    {
        $userId = auth()->id();

        if ($friendship->addressee_id !== $userId) {
            abort(403);
        }

        if ($friendship->status !== 'pending') {
            return back()->with('error', 'Permintaan pertemanan sudah diproses.');
        }

        $friendship->update([
            'status' => 'rejected',
            'responded_at' => now(),
        ]);

        return back()->with('success', 'Permintaan pertemanan ditolak.');
    }

    public function remove(Friendship $friendship)
    {
        $userId = auth()->id();

        if ($friendship->requester_id !== $userId && $friendship->addressee_id !== $userId) {
            abort(403);
        }

        $otherUserId = $friendship->requester_id === $userId ? $friendship->addressee_id : $friendship->requester_id;

        $friendship->delete();

        MemberHistory::create([
            'user_id' => $userId,
            'type' => 'friend_removed',
            'title' => 'Pertemanan dihapus',
            'description' => 'Pertemanan dihapus',
            'reference_type' => User::class,
            'reference_id' => $otherUserId,
        ]);

        return back()->with('success', 'Pertemanan berhasil dihapus.');
    }

    public function communities(User $user)
    {
        $currentUser = auth()->user();

        if ($user->profile && $user->profile->privacy === 'private') {
            return view('member.friends.communities', ['user' => $user, 'communities' => collect()]);
        }

        if ($user->profile && $user->profile->privacy === 'friends') {
            $isFriend = Friendship::where(function ($q) use ($currentUser, $user) {
                $q->where(['requester_id' => $currentUser->id, 'addressee_id' => $user->id])
                    ->orWhere(['requester_id' => $user->id, 'addressee_id' => $currentUser->id]);
            })->where('status', 'accepted')->exists();

            if (!$isFriend) {
                return view('member.friends.communities', ['user' => $user, 'communities' => collect()]);
            }
        }

        $communities = $user->joinedCommunities()
            ->where('visibility', 'public')
            ->with('category')
            ->get();

        return view('member.friends.communities', compact('user', 'communities'));
    }
}
