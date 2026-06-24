<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Community;
use App\Models\Brand;
use App\Models\Event;
use App\Models\Campaign;
use App\Models\CollaborationRequest;
use App\Models\RoleRequest;
use App\Models\EventPaymentConfirmation;
use App\Models\Donation;
use App\Models\ApprovalLog;
use App\Models\AuditLog;
use App\Services\PlatformFeeService;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_members' => User::where('id', '!=', null)->count(),
            'total_community_owners' => User::whereHas('roles', fn($q) => $q->where('name', 'community_owner'))->count(),
            'total_brand_owners' => User::whereHas('roles', fn($q) => $q->where('name', 'brand_owner'))->count(),
            'total_communities' => Community::count(),
            'total_brands' => Brand::count(),
            'total_events' => Event::count(),
            'total_collaborations' => CollaborationRequest::count(),
            'total_donations' => Donation::count(),
            'total_donation_amount' => Donation::where('status', 'confirmed')->sum('amount'),
            'pending_role_requests' => RoleRequest::where('status', 'pending')->count(),
            'pending_community_approvals' => Community::where('status', 'pending')->count(),
            'pending_brand_approvals' => Brand::where('status', 'pending')->count(),
        ];

        $platformFeeService = app(PlatformFeeService::class);
        $platformRevenue = $platformFeeService->getPlatformRevenue();

        $recentApprovals = ApprovalLog::with('reviewer')
            ->latest()
            ->take(10)
            ->get();

        $recentRoleRequests = RoleRequest::with('user')
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get();

        return view('superadmin.dashboard', compact(
            'stats',
            'platformRevenue',
            'recentApprovals',
            'recentRoleRequests'
        ));
    }
}
