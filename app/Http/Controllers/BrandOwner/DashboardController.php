<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Campaign;
use App\Models\CollaborationRequest;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $ownedBrands = Brand::where('owner_id', $user->id)->latest()->get();

        $totalCampaigns = Campaign::whereIn('brand_id', $ownedBrands->pluck('id'))->count();
        $activeCampaigns = Campaign::whereIn('brand_id', $ownedBrands->pluck('id'))
            ->where('status', 'active')
            ->count();

        $totalCollaborations = CollaborationRequest::whereIn('brand_id', $ownedBrands->pluck('id'))->count();
        $pendingCollaborations = CollaborationRequest::whereIn('brand_id', $ownedBrands->pluck('id'))
            ->where('status', 'pending')
            ->count();

        $stats = [
            'total_brands' => $ownedBrands->count(),
            'pending_brands' => $ownedBrands->where('status', 'pending')->count(),
            'approved_brands' => $ownedBrands->where('status', 'approved')->count(),
            'total_campaigns' => $totalCampaigns,
            'active_campaigns' => $activeCampaigns,
            'total_collaborations' => $totalCollaborations,
            'pending_collaborations' => $pendingCollaborations,
        ];

        return view('brand.dashboard', compact('user', 'ownedBrands', 'stats'));
    }
}
