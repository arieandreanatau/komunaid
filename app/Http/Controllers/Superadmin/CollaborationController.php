<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\CollaborationProposal;
use App\Models\AuditLog;
use App\Services\CsvExportService;
use Illuminate\Http\Request;

class CollaborationController extends Controller
{
    public function index(Request $request)
    {
        $query = CollaborationProposal::with('collaborationType', 'creator', 'reviewedBy');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('proposer_type', 'like', "%{$search}%");
            });
        }

        if ($request->filled('collaboration_type_id')) {
            $query->where('collaboration_type_id', $request->collaboration_type_id);
        }

        $proposals = $query->latest()->paginate(20);

        return view('superadmin.collaborations.index', compact('proposals'));
    }

    public function show(CollaborationProposal $proposal)
    {
        $proposal->load('collaborationType', 'creator', 'reviewedBy');

        if ($proposal->proposer_type === 'brand') {
            $proposal->load('proposer');
        } elseif ($proposal->proposer_type === 'company') {
            $proposal->load('proposer');
        }

        if ($proposal->target_type === 'community') {
            $proposal->load('target');
        }

        return view('superadmin.collaborations.show', compact('proposal'));
    }

    public function archive(Request $request, CollaborationProposal $proposal)
    {
        $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        $old = ['status' => $proposal->status];
        $proposal->update(['status' => 'archived']);

        AuditLog::log(
            'collaboration_proposal_archived',
            $proposal,
            'Collaboration proposal archived by superadmin' . ($request->reason ? '. Reason: ' . $request->reason : ''),
            $old,
            ['status' => 'archived']
        );

        return back()->with('success', 'Proposal berhasil diarsipkan.');
    }

    public function export(Request $request)
    {
        $query = CollaborationProposal::with('collaborationType', 'creator', 'reviewedBy');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $proposals = $query->latest()->get();

        $service = new CsvExportService();
        $service->exportCollaborations($proposals);
    }
}
