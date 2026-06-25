<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\RoleRequest;
use App\Services\RoleRequestService;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $approvedRequest = $user->roleRequests()
            ->where('status', 'approved')
            ->first();

        if ($approvedRequest) {
            $role = \Spatie\Permission\Models\Role::where('name', $approvedRequest->requested_role)->first();
            if ($role) {
                $redirectService = app(\App\Services\Auth\RedirectByRoleService::class);
                return redirect($redirectService->getRedirectPath($user));
            }
        }

        return view('auth.onboarding.index', compact('user'));
    }

    public function roleRequest()
    {
        $user = auth()->user();
        $role = request()->query('role', '');

        $allowedRoles = ['community_owner', 'brand_owner', 'company_owner'];

        if (!in_array($role, $allowedRoles)) {
            return redirect()->route('onboarding');
        }

        return view('auth.onboarding.role-request', compact('user', 'role'));
    }

    public function storeRoleRequest(Request $request)
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

        return redirect()->route('onboarding.role-request.status', ['roleRequest' => $roleRequest->id])
            ->with('success', 'Pengajuan role berhasil dikirim. Silakan menunggu persetujuan Superadmin.');
    }

    public function roleRequestStatus($roleRequestId)
    {
        $user = auth()->user();
        $roleRequest = $user->roleRequests()->findOrFail($roleRequestId);

        return view('auth.onboarding.role-request-status', compact('user', 'roleRequest'));
    }

    public function continueAsMember()
    {
        return redirect()->route('member.dashboard')
            ->with('success', 'Kamu menggunakan KomunaID sebagai Member. Selamat menjelajahi!');
    }
}
