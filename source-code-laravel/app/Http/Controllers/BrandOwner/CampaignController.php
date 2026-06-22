<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CampaignController extends Controller
{
    public function index()
    {
        $brands = auth()->user()->ownedBrands;
        $campaigns = Campaign::whereIn('brand_id', $brands->pluck('id'))
            ->with('brand')
            ->latest()
            ->paginate(10);

        return view('brand-owner.campaigns.index', compact('campaigns'));
    }

    public function create()
    {
        $brands = auth()->user()->ownedBrands()->where('status', 'approved')->get();
        return view('brand-owner.campaigns.create', compact('brands'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand_id' => 'required|exists:brands,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'target_audience' => 'nullable|string|max:255',
        ]);

        $brand = Brand::findOrFail($validated['brand_id']);
        if ($brand->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }

        $validated['created_by'] = auth()->id();

        Campaign::create($validated);

        return redirect()->route('brand-owner.campaigns.index')
            ->with('success', 'Campaign berhasil dibuat.');
    }

    public function show(Campaign $campaign)
    {
        if ($campaign->brand->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }
        $campaign->load('brand', 'creator');
        return view('brand-owner.campaigns.show', compact('campaign'));
    }

    public function edit(Campaign $campaign)
    {
        if ($campaign->brand->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }
        $brands = auth()->user()->ownedBrands()->where('status', 'approved')->get();
        return view('brand-owner.campaigns.edit', compact('campaign', 'brands'));
    }

    public function update(Request $request, Campaign $campaign)
    {
        if ($campaign->brand->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:5000',
            'budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'target_audience' => 'nullable|string|max:255',
            'status' => 'sometimes|in:draft,active,completed,cancelled',
        ]);

        $campaign->update($validated);

        return redirect()->route('brand-owner.campaigns.show', $campaign)
            ->with('success', 'Campaign berhasil diupdate.');
    }

    public function destroy(Campaign $campaign)
    {
        if ($campaign->brand->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }
        $campaign->delete();

        return redirect()->route('brand-owner.campaigns.index')
            ->with('success', 'Campaign berhasil dihapus.');
    }
}
