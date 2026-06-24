<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\Event;
use App\Models\Community;
use App\Services\WalletService;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    public function index()
    {
        $user = auth()->user();
        $donations = Donation::where('donor_id', $user->id)
            ->with('event', 'community')
            ->latest()
            ->paginate(15);

        return view('member.donations.index', compact('donations'));
    }

    public function createEventDonation(Event $event)
    {
        if (!$event->isFree()) {
            return back()->with('error', 'Donasi event hanya untuk event gratis.');
        }

        $event->load('community');

        return view('member.donations.create-event', compact('event'));
    }

    public function storeEventDonation(Request $request, Event $event)
    {
        if (!$event->isFree()) {
            return back()->with('error', 'Donasi event hanya untuk event gratis.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000|max:100000000',
            'message' => 'nullable|string|max:500',
        ]);

        $donation = Donation::create([
            'donor_id' => auth()->id(),
            'donation_type' => 'event_donation',
            'amount' => $validated['amount'],
            'message' => $validated['message'] ?? null,
            'status' => 'pending',
            'event_id' => $event->id,
            'community_id' => $event->community_id,
        ]);

        return redirect()->route('member.donations.index')
            ->with('success', 'Donasi berhasil diajukan. Menunggu konfirmasi.');
    }

    public function createCommunityDonation(Community $community)
    {
        return view('member.donations.create-community', compact('community'));
    }

    public function storeCommunityDonation(Request $request, Community $community)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000|max:100000000',
            'message' => 'nullable|string|max:500',
        ]);

        $donation = Donation::create([
            'donor_id' => auth()->id(),
            'donation_type' => 'community_donation',
            'amount' => $validated['amount'],
            'message' => $validated['message'] ?? null,
            'status' => 'pending',
            'community_id' => $community->id,
        ]);

        return redirect()->route('member.donations.index')
            ->with('success', 'Donasi komunitas berhasil diajukan. Menunggu konfirmasi.');
    }

    public function show(Donation $donation)
    {
        $donation->load('event', 'community', 'brand', 'donor');

        return view('member.donations.show', compact('donation'));
    }
}
