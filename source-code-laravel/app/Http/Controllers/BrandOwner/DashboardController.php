<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Models\Brand;

class DashboardController extends Controller
{
    public function index()
    {
        $brands = auth()->user()->ownedBrands()->withCount('campaigns')->get();
        $totalCampaigns = $brands->sum('campaigns_count');
        $collaborations = \App\Models\Collaboration::whereIn('brand_id', $brands->pluck('id'))->count();

        return view('brand-owner.dashboard', compact('brands', 'totalCampaigns', 'collaborations'));
    }
}
