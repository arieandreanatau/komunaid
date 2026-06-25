<?php

namespace App\Http\Controllers\CompanyOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompanyOwner\StoreCompanyRequest;
use App\Http\Requests\CompanyOwner\UpdateCompanyRequest;
use App\Models\Company;
use App\Models\AuditLog;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('viewAny', Company::class);

        $user = auth()->user();
        $companies = Company::where('owner_id', $user->id)
            ->withCount('brands')
            ->latest()
            ->paginate(10);

        return view('company-owner.companies.index', compact('companies'));
    }

    public function create()
    {
        $this->authorize('create', Company::class);
        return view('company-owner.companies.create');
    }

    public function store(StoreCompanyRequest $request)
    {
        $this->authorize('create', Company::class);

        $user = auth()->user();
        $data = $request->validated();
        $data['owner_id'] = $user->id;
        $data['status'] = 'active';
        $data['created_by'] = $user->id;
        $data['updated_by'] = $user->id;

        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('companies/logos', 'public');
        }

        $company = Company::create($data);

        AuditLog::log('company_created', $company, 'Company created: ' . $company->name);

        return redirect()->route('company-owner.companies.show', $company)
            ->with('success', 'Perusahaan berhasil dibuat.');
    }

    public function show(Company $company)
    {
        $this->authorize('view', $company);

        $company->load(['brands', 'owner']);
        $company->loadCount('brands');

        return view('company-owner.companies.show', compact('company'));
    }

    public function edit(Company $company)
    {
        $this->authorize('update', $company);
        return view('company-owner.companies.edit', compact('company'));
    }

    public function update(UpdateCompanyRequest $request, Company $company)
    {
        $this->authorize('update', $company);

        if ($company->isSuspendedOrBanned()) {
            return back()->with('error', 'Perusahaan yang disuspend/banned tidak bisa diperbarui.');
        }

        $user = auth()->user();
        $data = $request->validated();
        $data['updated_by'] = $user->id;

        if ($request->hasFile('logo')) {
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }
            $data['logo_path'] = $request->file('logo')->store('companies/logos', 'public');
        }

        $company->update($data);

        AuditLog::log('company_updated', $company, 'Company updated: ' . $company->name);

        return redirect()->route('company-owner.companies.show', $company)
            ->with('success', 'Perusahaan berhasil diperbarui.');
    }

    public function archive(Company $company)
    {
        $this->authorize('update', $company);

        $old = ['status' => $company->status];
        $company->update(['status' => 'archived']);

        AuditLog::log('company_archived', $company, 'Company archived: ' . $company->name, $old, ['status' => 'archived']);

        return redirect()->route('company-owner.companies.index')
            ->with('success', 'Perusahaan berhasil diarsipkan.');
    }

    public function destroy(Company $company)
    {
        $this->authorize('delete', $company);

        $old = ['status' => $company->status];
        $company->update(['status' => 'archived']);

        AuditLog::log('company_archived', $company, 'Company archived: ' . $company->name, $old, ['status' => 'archived']);

        return redirect()->route('company-owner.companies.index')
            ->with('success', 'Perusahaan berhasil diarsipkan.');
    }
}
