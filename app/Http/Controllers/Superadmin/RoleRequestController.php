<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleRequest\RejectRoleRequestRequest;
use App\Models\RoleRequest;
use App\Models\ApprovalLog;
use App\Models\AuditLog;
use App\Enums\ApprovalStatus;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleRequestController extends Controller
{
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

        $role = Role::where('name', $roleRequest->requested_role)->first();
        if (!$role) {
            return back()->with('error', 'Role ' . $roleRequest->requested_role . ' tidak ditemukan di sistem.');
        }

        \DB::beginTransaction();

        try {
            $locked = RoleRequest::where('id', $roleRequest->id)
                ->where('status', ApprovalStatus::PENDING)
                ->lockForUpdate()
                ->first();

            if (!$locked) {
                \DB::rollBack();
                return back()->with('error', 'Request ini sudah diproses.');
            }

            $locked->update([
                'status' => ApprovalStatus::APPROVED,
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            $user->assignRole($role);

            if (class_exists(ApprovalLog::class)) {
                ApprovalLog::create([
                    'reviewed_by' => auth()->id(),
                    'type' => 'role_request',
                    'approvable_id' => $locked->id,
                    'approvable_type' => RoleRequest::class,
                    'action' => 'approved',
                    'notes' => 'Role request disetujui: ' . $locked->requested_role,
                ]);
            }

            if (class_exists(AuditLog::class)) {
                AuditLog::log('role_request_approved', $locked, 'Role request disetujui untuk user ' . $user->name);
            }

            \DB::commit();

            return redirect()->route('superadmin.role-requests.index')
                ->with('success', 'Role request berhasil disetujui. User sekarang memiliki role ' . $locked->requested_role . '.');

        } catch (\Exception $e) {
            \DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan saat memproses approval.');
        }
    }

    public function reject(RejectRoleRequestRequest $request, RoleRequest $roleRequest)
    {
        if ($roleRequest->user_id === auth()->id()) {
            return back()->with('error', 'Anda tidak bisa reject request sendiri.');
        }

        \DB::beginTransaction();

        try {
            $locked = RoleRequest::where('id', $roleRequest->id)
                ->where('status', ApprovalStatus::PENDING)
                ->lockForUpdate()
                ->first();

            if (!$locked) {
                \DB::rollBack();
                return back()->with('error', 'Request ini sudah diproses.');
            }

            $locked->update([
                'status' => ApprovalStatus::REJECTED,
                'reason' => $request->input('reason'),
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            if (class_exists(ApprovalLog::class)) {
                ApprovalLog::create([
                    'reviewed_by' => auth()->id(),
                    'type' => 'role_request',
                    'approvable_id' => $locked->id,
                    'approvable_type' => RoleRequest::class,
                    'action' => 'rejected',
                    'notes' => 'Role request ditolak: ' . $request->input('reason'),
                ]);
            }

            if (class_exists(AuditLog::class)) {
                AuditLog::log('role_request_rejected', $locked, 'Role request ditolak untuk user ' . $locked->user->name);
            }

            \DB::commit();

            return redirect()->route('superadmin.role-requests.index')
                ->with('success', 'Role request berhasil ditolak.');

        } catch (\Exception $e) {
            \DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan saat memproses penolakan.');
        }
    }
}
