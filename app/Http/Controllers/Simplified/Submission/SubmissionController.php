<?php

declare(strict_types=1);

namespace App\Http\Controllers\Simplified\Submission;

use App\Http\Controllers\Controller;
use App\Http\Requests\Simplified\Submission\SubmitBrandRequest;
use App\Http\Requests\Simplified\Submission\SubmitCommunityRequest;
use App\Http\Requests\Simplified\Submission\SubmitCompanyRequest;
use App\Models\Company;
use App\Services\Simplified\FileUploadService;
use App\Services\Simplified\EntitySubmissionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class SubmissionController extends Controller
{
    public function __construct(
        private EntitySubmissionService $service,
        private FileUploadService $uploads,
    ) {}

    public function createCommunity(): View
    {
        return view('simplified.submissions.community.create');
    }

    public function storeCommunity(SubmitCommunityRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['logo'] = $this->uploads->upload($request, 'logo', 'communities');
        $data['banner'] = $this->uploads->upload($request, 'banner', 'communities');

        $community = $this->service->submitCommunity(Auth::user(), $data, $request);

        return redirect()->route('simplified.submissions.show', ['type' => 'community', 'id' => $community->id])
            ->with('success', 'Pengajuan komunitas berhasil dikirim dan sedang menunggu approval admin KomunaID.');
    }

    public function createBrand(): View
    {
        $companies = Company::where('status', 'approved')->orderBy('name')->get(['id', 'name']);
        return view('simplified.submissions.brand.create', compact('companies'));
    }

    public function storeBrand(SubmitBrandRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['logo'] = $this->uploads->upload($request, 'logo', 'brands');
        $data['banner'] = $this->uploads->upload($request, 'banner', 'brands');

        if (($data['company_relation'] ?? null) === 'will_create_company_later') {
            $data['company_id'] = null;
        }

        $brand = $this->service->submitBrand(Auth::user(), $data, $request);

        return redirect()->route('simplified.submissions.show', ['type' => 'brand', 'id' => $brand->id])
            ->with('success', 'Pengajuan brand berhasil dikirim dan sedang menunggu approval admin KomunaID.');
    }

    public function createCompany(): View
    {
        return view('simplified.submissions.company.create');
    }

    public function storeCompany(SubmitCompanyRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['logo'] = $this->uploads->upload($request, 'logo', 'companies');

        $company = $this->service->submitCompany(Auth::user(), $data, $request);

        return redirect()->route('simplified.submissions.show', ['type' => 'company', 'id' => $company->id])
            ->with('success', 'Pengajuan perusahaan berhasil dikirim dan sedang menunggu approval admin KomunaID.');
    }
}
