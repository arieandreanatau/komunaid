<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Brand;
use App\Models\Event;
use App\Models\RoleRequest;

class ApprovalController extends Controller
{
    public function index()
    {
        $pendingCommunities = Community::where('status', 'pending')->with('owner')->latest()->get();
        $pendingBrands = Brand::where('status', 'pending')->with('owner')->latest()->get();
        $pendingEvents = Event::where('status', 'pending')->with(['community', 'creator'])->latest()->get();
        $pendingRoleRequests = RoleRequest::where('status', 'pending')->with('user')->latest()->get();

        return view('superadmin.approvals.index', compact(
            'pendingCommunities',
            'pendingBrands',
            'pendingEvents',
            'pendingRoleRequests'
        ));
    }
}
