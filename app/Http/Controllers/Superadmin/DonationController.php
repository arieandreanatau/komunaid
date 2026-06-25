<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\ApprovalLog;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    public function index(Request $request)
    {
        $query = Donation::with('donor', 'event', 'community', 'brand');

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }
        if ($request->has('donation_type') && $request->donation_type !== '') {
            $query->where('donation_type', $request->donation_type);
        }

        $donations = $query->latest()->paginate(20);

        $stats = [
            'total_pending' => Donation::where('status', 'pending')->count(),
            'total_confirmed' => Donation::where('status', 'confirmed')->count(),
            'total_rejected' => Donation::where('status', 'rejected')->count(),
            'total_amount' => Donation::where('status', 'confirmed')->sum('amount'),
        ];

        return view('superadmin.donations.index', compact('donations', 'stats'));
    }

    public function show(Donation $donation)
    {
        $donation->load('donor', 'event', 'community', 'brand');

        return view('superadmin.donations.show', compact('donation'));
    }

    public function confirm(Donation $donation)
    {
        if ($donation->status !== 'pending') {
            return back()->with('error', 'Donasi ini sudah diproses.');
        }

        $donation->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        if ($donation->community && $donation->community->owner) {
            $walletService = app(\App\Services\WalletService::class);
            $walletService->credit(
                $donation->community->owner,
                (float) $donation->amount,
                "Donasi dari {$donation->donor->name}" . ($donation->event ? " untuk event: {$donation->event->title}" : ''),
                'donation',
                $donation
            );
        }

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'donation',
            'approvable_id' => $donation->id,
            'approvable_type' => Donation::class,
            'action' => 'confirmed',
            'notes' => 'Donasi dikonfirmasi.',
        ]);

        AuditLog::log('donation_confirmed', $donation, 'Donasi berhasil dikonfirmasi: Rp ' . number_format($donation->amount, 0, ',', '.'));

        return back()->with('success', 'Donasi berhasil dikonfirmasi.');
    }

    public function reject(Donation $donation)
    {
        if ($donation->status !== 'pending') {
            return back()->with('error', 'Donasi ini sudah diproses.');
        }

        $donation->update([
            'status' => 'rejected',
            'admin_notes' => request('admin_notes', 'Donasi ditolak oleh superadmin.'),
        ]);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'donation',
            'approvable_id' => $donation->id,
            'approvable_type' => Donation::class,
            'action' => 'rejected',
            'notes' => 'Donasi ditolak.',
        ]);

        AuditLog::log('donation_rejected', $donation, 'Donasi ditolak: Rp ' . number_format($donation->amount, 0, ',', '.'));

        return back()->with('success', 'Donasi ditolak.');
    }
}
