<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\RoleRequest;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = RoleRequest::with('user', 'reviewer');

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $roleRequests = $query->latest()->paginate(10);

        return view('superadmin.role-requests', compact('roleRequests'));
    }

    public function approve(RoleRequest $roleRequest)
    {
        if ($roleRequest->status !== 'pending') {
            return back()->with('error', 'Request ini sudah diproses.');
        }

        $roleRequest->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        $user = $roleRequest->user;
        $role = Role::where('name', $roleRequest->requested_role)->first();

        if ($role) {
            $user->removeRole('member');
            $user->assignRole($role);
        }

        return redirect()->route('superadmin.role-requests.index')->with('success', 'Role request berhasil disetujui. User sekarang memiliki role ' . $roleRequest->requested_role . '.');
    }

    public function reject(RoleRequest $roleRequest)
    {
        if ($roleRequest->status !== 'pending') {
            return back()->with('error', 'Request ini sudah diproses.');
        }

        $roleRequest->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return redirect()->route('superadmin.role-requests.index')->with('success', 'Role request berhasil ditolak.');
    }
}
