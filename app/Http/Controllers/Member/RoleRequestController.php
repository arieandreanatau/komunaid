<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\RoleRequest;
use App\Services\RoleRequestService;
use Illuminate\Http\Request;

class RoleRequestController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $roleRequests = $user->roleRequests()->latest()->get();

        return view('member.role-requests.index', compact('user', 'roleRequests'));
    }

    public function create()
    {
        $user = auth()->user();

        $existingRoles = $user->getRoleNames()->toArray();
        $pendingRoles = $user->roleRequests()
            ->where('status', 'pending')
            ->pluck('requested_role')
            ->toArray();

        $availableRoles = collect(['community_owner', 'brand_owner', 'company_owner'])
            ->filter(fn ($role) => !in_array($role, $existingRoles) && !in_array($role, $pendingRoles))
            ->values();

        return view('member.role-requests.create', compact('user', 'availableRoles', 'existingRoles'));
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'requested_role' => 'required|in:community_owner,brand_owner,company_owner',
            'motivation' => 'nullable|string|max:2000',
            'community_name' => 'nullable|string|max:255',
            'community_category' => 'nullable|string|max:255',
            'community_description' => 'nullable|string|max:2000',
            'community_regional' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'brand_industry' => 'nullable|string|max:255',
            'brand_website' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'company_industry' => 'nullable|string|max:255',
            'company_website' => 'nullable|string|max:255',
        ], [
            'requested_role.required' => 'Role wajib dipilih.',
            'requested_role.in' => 'Role yang dipilih tidak valid.',
        ]);

        $service = app(RoleRequestService::class);
        $error = $service->canRequestRole($user, $request->input('requested_role'));
        if ($error) {
            return back()->withErrors(['requested_role' => $error]);
        }

        $roleRequest = $service->createRequest($user, $request->validated());

        return redirect()->route('member.role-requests.show', $roleRequest)
            ->with('success', 'Pengajuan role berhasil dikirim. Silakan menunggu persetujuan Superadmin.');
    }

    public function show(RoleRequest $roleRequest)
    {
        $user = auth()->user();

        if ($roleRequest->user_id !== $user->id) {
            abort(403);
        }

        return view('member.role-requests.show', compact('user', 'roleRequest'));
    }
}
