<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\RoleRequest;
use App\Models\User;
use Illuminate\Http\Request;

class RoleRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = RoleRequest::with('user');

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $roleRequests = $query->latest()->paginate(15);

        return view('superadmin.role-requests.index', compact('roleRequests'));
    }

    public function approve(RoleRequest $roleRequest)
    {
        $roleRequest->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        $roleName = $roleRequest->requested_role === 'community_owner' ? 'community_owner' : 'brand_owner';
        $roleRequest->user->assignRole($roleName);

        return redirect()->back()->with('success', 'Role request berhasil di-approve.');
    }

    public function reject(RoleRequest $roleRequest)
    {
        $roleRequest->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Role request berhasil ditolak.');
    }
}
