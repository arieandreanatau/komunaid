<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\StoreRoleRequest;
use App\Models\RoleRequest;
use App\Enums\RequestedRole;

class RoleRequestController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $roleRequests = $user->roleRequests()->latest()->get();

        return view('member.role-request', compact('user', 'roleRequests'));
    }

    public function store(StoreRoleRequest $request)
    {
        $user = auth()->user();
        $requestedRole = $request->validated('requested_role');

        if ($user->hasRole($requestedRole)) {
            return back()->withErrors([
                'requested_role' => 'Anda sudah memiliki role ini.',
            ]);
        }

        if ($user->hasPendingRoleRequest($requestedRole)) {
            return back()->withErrors([
                'requested_role' => 'Anda sudah memiliki request role yang sedang diproses.',
            ]);
        }

        RoleRequest::create([
            'user_id' => $user->id,
            'requested_role' => $requestedRole,
            'status' => 'pending',
        ]);

        return redirect()->route('member.role-request.index')->with('success', 'Role request berhasil dikirim. Silakan menunggu persetujuan.');
    }
}
