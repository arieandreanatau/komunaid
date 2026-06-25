<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Community;
use App\Models\Brand;
use App\Models\Event;
use App\Models\Company;
use App\Models\Campaign;
use App\Models\CollaborationRequest;
use App\Models\RoleRequest;
use App\Models\EventPaymentConfirmation;
use App\Models\Donation;
use App\Models\ApprovalLog;
use App\Models\AuditLog;
use App\Models\LoginLog;
use App\Services\PlatformFeeService;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_members' => User::count(),
            'total_active_members' => User::whereNull('banned_at')->count(),
            'total_banned_members' => User::whereNotNull('banned_at')->count(),
            'total_community_owners' => User::whereHas('roles', fn($q) => $q->where('name', 'community_owner'))->count(),
            'total_brand_owners' => User::whereHas('roles', fn($q) => $q->where('name', 'brand_owner'))->count(),
            'total_company_owners' => User::whereHas('roles', fn($q) => $q->where('name', 'company_owner'))->count(),
            'total_communities' => Community::count(),
            'total_active_communities' => Community::where('status', 'approved')->count(),
            'total_suspended_communities' => Community::where('status', 'suspended')->count(),
            'total_events' => Event::count(),
            'total_published_events' => Event::where('approval_status', 'approved')->count(),
            'total_upcoming_events' => Event::where('start_datetime', '>', now())->count(),
            'total_brands' => Brand::count(),
            'total_companies' => class_exists(Company::class) ? Company::count() : 0,
            'pending_role_requests' => RoleRequest::where('status', 'pending')->count(),
            'pending_community_approvals' => Community::where('status', 'pending')->count(),
            'pending_brand_approvals' => Brand::where('status', 'pending')->count(),
            'total_collaborations' => CollaborationRequest::count(),
            'total_donations' => Donation::count(),
            'total_donation_amount' => Donation::where('status', 'confirmed')->sum('amount'),
        ];

        $stats['total_login_today'] = LoginLog::whereDate('created_at', today())->count();
        $stats['total_audit_today'] = AuditLog::whereDate('created_at', today())->count();

        $newUsersThisMonth = User::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $newCommunitiesThisMonth = Community::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $newEventsThisMonth = Event::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $latestUsers = User::latest()->take(5)->get();
        $latestCommunities = Community::with('owner')->latest()->take(5)->get();

        $recentRoleRequests = RoleRequest::with('user')
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get();

        $latestActivities = AuditLog::with('user')
            ->latest()
            ->take(10)
            ->get();

        $platformFeeService = app(PlatformFeeService::class);
        $platformRevenue = $platformFeeService->getPlatformRevenue();

        return view('superadmin.dashboard', compact(
            'stats',
            'platformRevenue',
            'newUsersThisMonth',
            'newCommunitiesThisMonth',
            'newEventsThisMonth',
            'latestUsers',
            'latestCommunities',
            'recentRoleRequests',
            'latestActivities'
        ));
    }
}
