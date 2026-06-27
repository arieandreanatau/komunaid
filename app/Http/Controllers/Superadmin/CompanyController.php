<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\AuditLog;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Company::class);

        $query = Company::with('owner');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('industry', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $companies = $query->latest()->paginate(20);

        return view('superadmin.companies.index', compact('companies'));
    }

    public function show(Company $company)
    {
        $this->authorize('view', $company);

        $company->load(['owner', 'brands']);
        $brandsCount = $company->brands()->count();

        return view('superadmin.companies.show', compact('company', 'brandsCount'));
    }

    public function suspend(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $old = ['status' => $company->status];
        $company->update(['status' => 'suspended']);

        AuditLog::log('company_suspended', $company, 'Perusahaan disuspend: ' . $company->name . '. Alasan: ' . $request->reason, $old, ['status' => 'suspended']);

        return back()->with('success', 'Perusahaan berhasil disuspend.');
    }

    public function ban(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $old = ['status' => $company->status];
        $company->update(['status' => 'banned']);

        AuditLog::log('company_banned', $company, 'Perusahaan dibanned: ' . $company->name . '. Alasan: ' . $request->reason, $old, ['status' => 'banned']);

        return back()->with('success', 'Perusahaan berhasil dibanned.');
    }

    public function activate(Company $company)
    {
        $this->authorize('update', $company);

        $old = ['status' => $company->status];
        $company->update(['status' => 'active']);

        AuditLog::log('company_activated', $company, 'Perusahaan diaktifkan: ' . $company->name, $old, ['status' => 'active']);

        return back()->with('success', 'Perusahaan berhasil diaktifkan.');
    }

    public function verify(Company $company)
    {
        $this->authorize('approve', $company);

        $old = ['is_verified' => $company->is_verified, 'status' => $company->status];
        $company->update(['is_verified' => true, 'status' => 'active']);

        AuditLog::log('company_verified', $company, 'Perusahaan diverifikasi: ' . $company->name, $old, ['is_verified' => true, 'status' => 'active']);

        return back()->with('success', 'Perusahaan berhasil diverifikasi.');
    }

    public function destroy(Company $company)
    {
        $this->authorize('delete', $company);

        $old = ['status' => $company->status];
        $company->update(['status' => 'archived']);

        AuditLog::log('company_archived', $company, 'Perusahaan diarsipkan: ' . $company->name, $old, ['status' => 'archived']);

        return redirect()->route('superadmin.companies.index')->with('success', 'Perusahaan berhasil diarsipkan.');
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Company::class);

        $query = Company::with('owner');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $companies = $query->latest()->get();

        $filename = 'komunaid_companies_' . date('Ymd') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($companies) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Name', 'Legal Name', 'Owner', 'Industry', 'City', 'Province', 'Status', 'Verified', 'Created At']);

            foreach ($companies as $company) {
                fputcsv($handle, [
                    $company->id,
                    $company->name,
                    $company->legal_name ?? '-',
                    $company->owner->name ?? '-',
                    $company->industry ?? '-',
                    $company->city ?? '-',
                    $company->province ?? '-',
                    $company->status,
                    $company->is_verified ? 'Yes' : 'No',
                    $company->created_at?->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
