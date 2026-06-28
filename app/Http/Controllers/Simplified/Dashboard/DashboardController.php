<?php

declare(strict_types=1);

namespace App\Http\Controllers\Simplified\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Community;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(Request $request): View
    {
        $user = Auth::user();

        $pendingCommunities = Community::where('owner_id', $user->id)
            ->whereIn('status', ['pending_approval', 'need_revision', 'rejected'])
            ->orderByDesc('submitted_at')
            ->get();

        $pendingBrands = Brand::where('owner_id', $user->id)
            ->whereIn('status', ['pending_approval', 'need_revision', 'rejected'])
            ->orderByDesc('submitted_at')
            ->get();

        $pendingCompanies = Company::where('owner_id', $user->id)
            ->whereIn('status', ['pending_approval', 'need_revision', 'rejected'])
            ->orderByDesc('submitted_at')
            ->get();

        $approvedCommunities = Community::where('owner_id', $user->id)
            ->where('status', 'approved')
            ->get();

        $approvedBrands = Brand::where('owner_id', $user->id)
            ->where('status', 'approved')
            ->get();

        $approvedCompanies = Company::where('owner_id', $user->id)
            ->where('status', 'approved')
            ->get();

        $isAdmin = $user->hasRole('superadmin') || $user->hasRole('admin_platform');

        $adminCounts = [];
        if ($isAdmin) {
            $adminCounts = [
                'communities' => Community::where('status', 'pending_approval')->count(),
                'brands' => Brand::where('status', 'pending_approval')->count(),
                'companies' => Company::where('status', 'pending_approval')->count(),
            ];
        }

        return view('simplified.dashboard.index', compact(
            'user',
            'pendingCommunities',
            'pendingBrands',
            'pendingCompanies',
            'approvedCommunities',
            'approvedBrands',
            'approvedCompanies',
            'isAdmin',
            'adminCounts',
        ));
    }
}
