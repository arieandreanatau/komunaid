<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\MemberJoinHistory;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function join(Community $community)
    {
        $user = auth()->user();

        if (!$community->isApproved()) {
            return back()->with('error', 'Komunitas belum disetujui.');
        }

        $check = $user->canJoinCommunity($community);

        if (!$check['allowed']) {
            return back()->with('error', $check['reason']);
        }

        CommunityMember::create([
            'community_id' => $community->id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        MemberJoinHistory::create([
            'community_id' => $community->id,
            'user_id' => $user->id,
            'action' => 'joined',
            'acted_at' => now(),
        ]);

        return back()->with('success', "Berhasil bergabung dengan {$community->name}!");
    }

    public function leave(Community $community)
    {
        $user = auth()->user();

        $membership = CommunityMember::where('community_id', $community->id)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (!$membership) {
            return back()->with('error', 'Anda bukan anggota komunitas ini.');
        }

        $membership->update(['status' => 'left']);

        MemberJoinHistory::create([
            'community_id' => $community->id,
            'user_id' => $user->id,
            'action' => 'left',
            'acted_at' => now(),
        ]);

        $joinCount = $user->joinHistories()
            ->where('community_id', $community->id)
            ->whereIn('action', ['joined', 'left'])
            ->count();

        if ($joinCount >= 6) {
            $nextJoin = $user->joinHistories()
                ->where('community_id', $community->id)
                ->where('action', 'left')
                ->latest('acted_at')
                ->first();

            if ($nextJoin) {
                $disabledUntil = $nextJoin->acted_at->addMonth();
                return back()->with('warning', "Anda telah keluar masuk {$joinCount}x. Join akan disabled hingga {$disabledUntil->format('d M Y')}.");
            }
        }

        return back()->with('success', "Berhasil keluar dari {$community->name}.");
    }

    public function report(Community $community, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|in:spam,inappropriate,scam,fake,harassment,other',
            'message' => 'nullable|string|max:2000',
        ], [
            'reason.required' => 'Alasan pelaporan wajib dipilih.',
            'reason.in' => 'Alasan pelaporan tidak valid.',
        ]);

        $user = auth()->user();

        $reportReasons = [
            'spam' => 'Spam / Konten Tidak Relevan',
            'inappropriate' => 'Konten Tidak Pantas',
            'scam' => 'Penipuan / Scam',
            'fake' => 'Akun Palsu / Komunitas Palsu',
            'harassment' => 'Pelecehan / Cyberbullying',
            'other' => 'Lainnya',
        ];

        $subject = 'Laporan Komunitas: ' . $community->name . ' [' . ($reportReasons[$request->input('reason')] ?? $request->input('reason')) . ']';

        $message = $request->input('message', '');
        $message .= "\n\n--- Info Laporan ---";
        $message .= "\nKomunitas: {$community->name}";
        $message .= "\nSlug: {$community->slug}";
        $message .= "\nAlasan: " . ($reportReasons[$request->input('reason')] ?? $request->input('reason'));

        $suggestionClass = \App\Models\Suggestion::class;
        if (class_exists($suggestionClass)) {
            $suggestionClass::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'subject' => $subject,
                'message' => $message,
                'status' => 'new',
            ]);
        }

        return back()->with('success', 'Laporan berhasil dikirim. Terima kasih atas laporan Anda.');
    }
}
