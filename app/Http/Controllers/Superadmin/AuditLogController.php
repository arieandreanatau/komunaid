<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $auditLogs = $query->latest()->paginate(30);
        $actions = AuditLog::distinct()->pluck('action')->filter()->sort()->values();

        return view('superadmin.audit-logs.index', compact('auditLogs', 'actions'));
    }

    public function show(AuditLog $auditLog)
    {
        $auditLog->load('user');
        $subject = null;
        if ($auditLog->subject_type && $auditLog->subject_id) {
            $subjectClass = $auditLog->subject_type;
            $subject = $subjectClass::find($auditLog->subject_id);
        }

        return view('superadmin.audit-logs.show', compact('auditLog', 'subject'));
    }
}
