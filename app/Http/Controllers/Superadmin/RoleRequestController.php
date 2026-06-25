<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleRequest\RejectRoleRequestRequest;
use App\Models\RoleRequest;
use App\Models\AuditLog;
use App\Services\Auth\RoleRequestService;
use Illuminate\Http\Request;

class RoleRequestController extends Controller
{
    public function __construct(private readonly RoleRequestService $service) {}

    public function index(Request $request)
    {
        $query = RoleRequest::with('user', 'reviewer');

        if ($request->filled('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->filled('requested_role') && $request->requested_role !== '') {
            $query->where('requested_role', $request->requested_role);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $roleRequests = $query->latest()->paginate(15);

        return view('superadmin.role-requests.index', compact('roleRequests'));
    }

    public function show(RoleRequest $roleRequest)
    {
        $roleRequest->load('user', 'reviewer');

        return view('superadmin.role-requests.show', compact('roleRequest'));
    }

    public function approve(Request $request, RoleRequest $roleRequest)
    {
        if ($roleRequest->user_id === auth()->id()) {
            return back()->with('error', 'Anda tidak bisa approve request sendiri.');
        }

        $user = $roleRequest->user;

        if ($user->isBannedOrSuspended()) {
            return back()->with('error', 'User ini sedang dibatasi.');
        }

        if (!\Spatie\Permission\Models\Role::where('name', $roleRequest->requested_role)->exists()) {
            return back()->with('error', 'Role ' . $roleRequest->requested_role . ' tidak ditemukan di sistem.');
        }

        $ok = $this->service->approve($roleRequest, $request->user());

        if (!$ok) {
            return back()->with('error', 'Request ini sudah diproses atau tidak dapat disetujui.');
        }

        if (class_exists(AuditLog::class)) {
            AuditLog::log('role_request_approved', $roleRequest, 'Role request disetujui untuk user ' . $user->name);
        }

        return redirect()->route('superadmin.role-requests.index')
            ->with('success', 'Role request berhasil disetujui. User sekarang memiliki role ' . $roleRequest->requested_role . '.');
    }

    public function reject(RejectRoleRequestRequest $request, RoleRequest $roleRequest)
    {
        if ($roleRequest->user_id === auth()->id()) {
            return back()->with('error', 'Anda tidak bisa reject request sendiri.');
        }

        $ok = $this->service->reject($roleRequest, $request->user(), $request->input('reason'));

        if (!$ok) {
            return back()->with('error', 'Request ini sudah diproses atau tidak dapat ditolak.');
        }

        if (class_exists(AuditLog::class)) {
            AuditLog::log('role_request_rejected', $roleRequest, 'Role request ditolak untuk user ' . $roleRequest->user->name);
        }

        return redirect()->route('superadmin.role-requests.index')
            ->with('success', 'Role request berhasil ditolak.');
    }
}
