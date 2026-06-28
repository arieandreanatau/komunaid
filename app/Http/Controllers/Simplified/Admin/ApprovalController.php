<?php

declare(strict_types=1);

namespace App\Http\Controllers\Simplified\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Simplified\Admin\RejectEntityRequest;
use App\Http\Requests\Simplified\Admin\RequestRevisionRequest;
use App\Models\Brand;
use App\Models\Community;
use App\Models\Company;
use App\Models\User;
use App\Services\Simplified\ApprovalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class ApprovalController extends Controller
{
    public function __construct(private ApprovalService $service) {}

    public function index(Request $request): View
    {
        return view('simplified.admin.approvals.index');
    }

    public function communities(Request $request): View
    {
        $status = $request->query('status', 'pending_approval');
        $items = Community::with('owner')
            ->where('status', $status)
            ->orderByDesc('submitted_at')
            ->paginate(20);
        return view('simplified.admin.approvals.communities.index', compact('items', 'status'));
    }

    public function brands(Request $request): View
    {
        $status = $request->query('status', 'pending_approval');
        $items = Brand::with('owner')
            ->where('status', $status)
            ->orderByDesc('submitted_at')
            ->paginate(20);
        return view('simplified.admin.approvals.brands.index', compact('items', 'status'));
    }

    public function companies(Request $request): View
    {
        $status = $request->query('status', 'pending_approval');
        $items = Company::with('owner')
            ->where('status', $status)
            ->orderByDesc('submitted_at')
            ->paginate(20);
        return view('simplified.admin.approvals.companies.index', compact('items', 'status'));
    }

    public function showCommunity(int $id): View
    {
        $community = Community::with('owner')->findOrFail($id);
        return view('simplified.admin.approvals.communities.show', compact('community'));
    }

    public function showBrand(int $id): View
    {
        $brand = Brand::with('owner')->findOrFail($id);
        return view('simplified.admin.approvals.brands.show', compact('brand'));
    }

    public function showCompany(int $id): View
    {
        $company = Company::with('owner')->findOrFail($id);
        return view('simplified.admin.approvals.companies.show', compact('company'));
    }

    public function approveCommunity(Request $request, int $id): RedirectResponse
    {
        $community = Community::findOrFail($id);
        abort_if($community->owner_id === Auth::id(), 403, 'Tidak bisa approve entity sendiri.');
        $this->service->approve($community, Auth::user(), $request);
        return back()->with('success', 'Komunitas disetujui.');
    }

    public function rejectCommunity(RejectEntityRequest $request, int $id): RedirectResponse
    {
        $community = Community::findOrFail($id);
        abort_if($community->owner_id === Auth::id(), 403);
        $this->service->reject($community, $request->input('rejection_reason'), Auth::user(), $request);
        return back()->with('success', 'Komunitas ditolak.');
    }

    public function revisionCommunity(RequestRevisionRequest $request, int $id): RedirectResponse
    {
        $community = Community::findOrFail($id);
        abort_if($community->owner_id === Auth::id(), 403);
        $this->service->requestRevision($community, $request->input('revision_notes'), Auth::user(), $request);
        return back()->with('success', 'Permintaan revisi dikirim.');
    }

    public function suspendCommunity(Request $request, int $id): RedirectResponse
    {
        $community = Community::findOrFail($id);
        $this->service->suspend($community, 'Suspended by admin', Auth::user(), $request);
        return back()->with('success', 'Komunitas disuspend.');
    }

    public function approveBrand(Request $request, int $id): RedirectResponse
    {
        $brand = Brand::findOrFail($id);
        abort_if($brand->owner_id === Auth::id(), 403);
        $this->service->approve($brand, Auth::user(), $request);
        return back()->with('success', 'Brand disetujui.');
    }

    public function rejectBrand(RejectEntityRequest $request, int $id): RedirectResponse
    {
        $brand = Brand::findOrFail($id);
        abort_if($brand->owner_id === Auth::id(), 403);
        $this->service->reject($brand, $request->input('rejection_reason'), Auth::user(), $request);
        return back()->with('success', 'Brand ditolak.');
    }

    public function revisionBrand(RequestRevisionRequest $request, int $id): RedirectResponse
    {
        $brand = Brand::findOrFail($id);
        abort_if($brand->owner_id === Auth::id(), 403);
        $this->service->requestRevision($brand, $request->input('revision_notes'), Auth::user(), $request);
        return back()->with('success', 'Permintaan revisi dikirim.');
    }

    public function suspendBrand(Request $request, int $id): RedirectResponse
    {
        $brand = Brand::findOrFail($id);
        $this->service->suspend($brand, 'Suspended by admin', Auth::user(), $request);
        return back()->with('success', 'Brand disuspend.');
    }

    public function approveCompany(Request $request, int $id): RedirectResponse
    {
        $company = Company::findOrFail($id);
        abort_if($company->owner_id === Auth::id(), 403);
        $this->service->approve($company, Auth::user(), $request);
        return back()->with('success', 'Perusahaan disetujui.');
    }

    public function rejectCompany(RejectEntityRequest $request, int $id): RedirectResponse
    {
        $company = Company::findOrFail($id);
        abort_if($company->owner_id === Auth::id(), 403);
        $this->service->reject($company, $request->input('rejection_reason'), Auth::user(), $request);
        return back()->with('success', 'Perusahaan ditolak.');
    }

    public function revisionCompany(RequestRevisionRequest $request, int $id): RedirectResponse
    {
        $company = Company::findOrFail($id);
        abort_if($company->owner_id === Auth::id(), 403);
        $this->service->requestRevision($company, $request->input('revision_notes'), Auth::user(), $request);
        return back()->with('success', 'Permintaan revisi dikirim.');
    }

    public function suspendCompany(Request $request, int $id): RedirectResponse
    {
        $company = Company::findOrFail($id);
        $this->service->suspend($company, 'Suspended by admin', Auth::user(), $request);
        return back()->with('success', 'Perusahaan disuspend.');
    }
}
