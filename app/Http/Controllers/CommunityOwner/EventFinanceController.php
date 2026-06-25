<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Event;
use App\Models\EventDonation;
use App\Models\EventFinanceSummary;
use App\Models\EventFinanceTransaction;
use App\Services\Event\EventFinanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EventFinanceController extends Controller
{
    public function __construct(private readonly EventFinanceService $financeService) {}

    private function recalculateSummary(Event $event): void
    {
        $this->financeService->recomputeSummary($event);
    }

    public function index(Event $event, Request $request)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        $query = $event->financeTransactions()->with('createdBy', 'verifiedBy');

        if ($request->has('type') && $request->type !== '') {
            $query->where('type', $request->type);
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $transactions = $query->latest()->paginate(15)->withQueryString();
        $summary = $event->financeSummary;

        return view('community.events.finance.index', compact('event', 'transactions', 'summary'));
    }

    public function create(Event $event)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        return view('community.events.finance.create', compact('event'));
    }

    public function store(Request $request, Event $event)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'proof' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:4096',
        ]);

        $validated['event_id'] = $event->id;
        $validated['created_by'] = $user->id;
        $validated['status'] = 'pending';

        if ($request->hasFile('proof')) {
            $validated['proof_path'] = Storage::disk('public')->put('event-finance', $request->file('proof'));
        }

        unset($validated['proof']);

        EventFinanceTransaction::create($validated);

        $this->recalculateSummary($event);

        return redirect()->route('community.events.finance.index', $event)
            ->with('success', 'Transaksi keuangan berhasil dibuat!');
    }

    public function edit(Event $event, EventFinanceTransaction $transaction)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($transaction->event_id !== $event->id) {
            abort(404);
        }

        return view('community.events.finance.edit', compact('event', 'transaction'));
    }

    public function update(Request $request, Event $event, EventFinanceTransaction $transaction)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($transaction->event_id !== $event->id) {
            abort(404);
        }

        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'proof' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:4096',
        ]);

        if ($request->hasFile('proof')) {
            $validated['proof_path'] = Storage::disk('public')->put('event-finance', $request->file('proof'));
        }

        unset($validated['proof']);

        $transaction->update($validated);

        $this->recalculateSummary($event);

        return redirect()->route('community.events.finance.index', $event)
            ->with('success', 'Transaksi keuangan berhasil diperbarui.');
    }

    public function verify(Event $event, EventFinanceTransaction $transaction)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($transaction->event_id !== $event->id) {
            abort(404);
        }

        if ($transaction->status === 'verified') {
            return back()->with('error', 'Transaksi sudah terverifikasi.');
        }

        $transaction->update([
            'status' => 'verified',
            'verified_by' => $user->id,
            'verified_at' => now(),
        ]);

        $this->recalculateSummary($event);

        return back()->with('success', 'Transaksi keuangan berhasil diverifikasi.');
    }

    public function reject(Request $request, Event $event, EventFinanceTransaction $transaction)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($transaction->event_id !== $event->id) {
            abort(404);
        }

        if ($transaction->status === 'rejected') {
            return back()->with('error', 'Transaksi sudah ditolak sebelumnya.');
        }

        $transaction->update([
            'status' => 'rejected',
        ]);

        $this->recalculateSummary($event);

        return back()->with('success', 'Transaksi keuangan berhasil ditolak.');
    }

    public function destroy(Event $event, EventFinanceTransaction $transaction)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        if ($transaction->event_id !== $event->id) {
            abort(404);
        }

        $transaction->delete();

        $this->recalculateSummary($event);

        return redirect()->route('community.events.finance.index', $event)
            ->with('success', 'Transaksi keuangan berhasil dihapus.');
    }

    public function export(Event $event)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        if (!$communityIds->contains($event->community_id)) {
            abort(404);
        }

        $transactions = $event->financeTransactions()->get();

        $filename = 'finance-' . $event->slug . '-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        return response()->stream(function () use ($transactions, $event) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['ID', 'Type', 'Category', 'Title', 'Description', 'Amount', 'Transaction Date', 'Status', 'Created By', 'Verified By', 'Verified At']);

            foreach ($transactions as $transaction) {
                fputcsv($handle, [
                    $transaction->id,
                    $transaction->type,
                    $transaction->category,
                    $transaction->title,
                    $transaction->description ?? '-',
                    $transaction->amount,
                    $transaction->transaction_date?->format('Y-m-d'),
                    $transaction->status,
                    $transaction->createdBy->name ?? '-',
                    $transaction->verifiedBy->name ?? '-',
                    $transaction->verified_at?->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
