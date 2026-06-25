<?php

namespace App\Http\Controllers\CompanyOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompanyOwner\StoreBrandUnderCompanyRequest;
use App\Models\Brand;
use App\Models\Company;
use App\Models\AuditLog;
use App\Services\CompanyOwnershipService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyBrandController extends Controller
{
    protected $ownershipService;

    public function __construct(CompanyOwnershipService $ownershipService)
    {
        $this->ownershipService = $ownershipService;
    }

    public function index(Company $company)
    {
        $user = auth()->user();

        if (!$this->ownershipService->canManageCompany($company, $user)) {
            abort(403);
        }

        $brands = $company->brands()->latest()->paginate(10);

        return view('company-owner.companies.brands.index', compact('company', 'brands'));
    }

    public function create(Company $company)
    {
        $user = auth()->user();

        if (!$this->ownershipService->canManageCompany($company, $user)) {
            abort(403);
        }

        return view('company-owner.companies.brands.create', compact('company'));
    }

    public function store(StoreBrandUnderCompanyRequest $request, Company $company)
    {
        $user = auth()->user();

        if (!$this->ownershipService->canManageCompany($company, $user)) {
            abort(403);
        }

        $data = $request->validated();
        $data['owner_id'] = $user->id;
        $data['company_id'] = $company->id;
        $data['status'] = 'active';
        $data['created_by'] = $user->id;
        $data['updated_by'] = $user->id;

        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('brands/logos', 'public');
        }

        $brand = Brand::create($data);

        AuditLog::log('brand_created_under_company', $brand, "Brand {$brand->name} created under company {$company->name}");

        return redirect()->route('company-owner.companies.brands.index', $company)
            ->with('success', 'Brand berhasil dibuat di bawah perusahaan.');
    }

    public function attach(Request $request, Company $company, Brand $brand)
    {
        $user = auth()->user();

        if (!$this->ownershipService->canManageCompany($company, $user)) {
            abort(403);
        }

        if ($brand->company_id === $company->id) {
            return back()->with('warning', 'Brand sudah berada di perusahaan ini.');
        }

        if ($brand->company_id !== null) {
            return back()->with('error', 'Brand sudah berada di bawah perusahaan lain. Detach terlebih dahulu.');
        }

        $this->ownershipService->attachBrandToCompany($brand, $company, $user);

        return back()->with('success', 'Brand berhasil dihubungkan ke perusahaan.');
    }

    public function detach(Request $request, Company $company, Brand $brand)
    {
        $user = auth()->user();

        if (!$this->ownershipService->canManageCompany($company, $user)) {
            abort(403);
        }

        if ($brand->company_id !== $company->id) {
            return back()->with('error', 'Brand tidak berada di perusahaan ini.');
        }

        $this->ownershipService->detachBrandFromCompany($brand, $company, $user);

        return back()->with('success', 'Brand berhasil dilepas dari perusahaan.');
    }
}
