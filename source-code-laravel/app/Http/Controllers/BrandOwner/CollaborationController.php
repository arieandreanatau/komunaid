<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Community;
use App\Models\Collaboration;
use Illuminate\Http\Request;

class CollaborationController extends Controller
{
    public function index()
    {
        $brands = auth()->user()->ownedBrands;
        $collaborations = Collaboration::whereIn('brand_id', $brands->pluck('id'))
            ->with(['community', 'brand', 'campaign'])
            ->latest()
            ->paginate(10);

        return view('brand-owner.collaborations.index', compact('collaborations'));
    }

    public function create(Request $request)
    {
        $brands = auth()->user()->ownedBrands()->where('status', 'approved')->get();
        $communities = Community::where('status', 'approved')->get();
        $campaigns = \App\Models\Campaign::whereIn('brand_id', $brands->pluck('id'))->get();
        $selectedCommunity = $request->query('community_id');

        return view('brand-owner.collaborations.create', compact('brands', 'communities', 'campaigns', 'selectedCommunity'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand_id' => 'required|exists:brands,id',
            'community_id' => 'required|exists:communities,id',
            'campaign_id' => 'nullable|exists:campaigns,id',
            'type' => 'required|in:free_collaboration,paid_collaboration,sponsorship,csr_donation,tap_in_event',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:10000',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $brand = Brand::findOrFail($validated['brand_id']);
        if ($brand->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }

        $validated['initiated_by'] = auth()->id();
        $validated['status'] = 'pending';

        Collaboration::create($validated);

        return redirect()->route('brand-owner.collaborations.index')
            ->with('success', 'Proposal kolaborasi berhasil dikirim. Menunggu response dari community owner.');
    }

    public function show(Collaboration $collaboration)
    {
        $brand = $collaboration->brand;
        if ($brand->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }

        $collaboration->load('community', 'brand', 'campaign', 'initiator');
        return view('brand-owner.collaborations.show', compact('collaboration'));
    }
}
