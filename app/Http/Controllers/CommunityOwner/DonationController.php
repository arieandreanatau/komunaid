<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Donation;
use App\Services\WalletService;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        $query = Donation::whereIn('community_id', $communityIds)
            ->with('donor', 'event', 'community');

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $donations = $query->latest()->paginate(20);

        $stats = [
            'total_pending' => Donation::whereIn('community_id', $communityIds)->where('status', 'pending')->count(),
            'total_confirmed' => Donation::whereIn('community_id', $communityIds)->where('status', 'confirmed')->count(),
            'total_amount' => Donation::whereIn('community_id', $communityIds)->where('status', 'confirmed')->sum('amount'),
        ];

        return view('community.donations.index', compact('donations', 'stats'));
    }

    public function show(Donation $donation)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($donation->community_id)) {
            abort(403);
        }

        $donation->load('donor', 'event', 'community', 'brand');

        return view('community.donations.show', compact('donation'));
    }

    public function confirm(Donation $donation)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($donation->community_id)) {
            abort(403);
        }

        if ($donation->status !== 'pending') {
            return back()->with('error', 'Donasi ini sudah diproses.');
        }

        $donation->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        if ($donation->community && $donation->community->owner) {
            $this->walletService->credit(
                $donation->community->owner,
                (float) $donation->amount,
                "Donasi dari {$donation->donor->name}" . ($donation->event ? " untuk event: {$donation->event->title}" : ''),
                'donation',
                $donation
            );
        }

        return back()->with('success', 'Donasi berhasil dikonfirmasi.');
    }

    public function reject(Donation $donation)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($donation->community_id)) {
            abort(403);
        }

        if ($donation->status !== 'pending') {
            return back()->with('error', 'Donasi ini sudah diproses.');
        }

        $donation->update([
            'status' => 'rejected',
            'admin_notes' => request('admin_notes', 'Donasi ditolak.'),
        ]);

        return back()->with('success', 'Donasi ditolak.');
    }
}
