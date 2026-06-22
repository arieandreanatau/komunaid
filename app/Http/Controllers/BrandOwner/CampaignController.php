<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\BrandOwner\StoreCampaignRequest;
use App\Http\Requests\BrandOwner\UpdateCampaignRequest;
use App\Models\Brand;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $brandIds = Brand::where('owner_id', $user->id)->pluck('id');

        $query = Campaign::whereIn('brand_id', $brandIds)->with('brand');

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $campaigns = $query->latest()->paginate(10);

        return view('brand.campaigns.index', compact('campaigns'));
    }

    public function create()
    {
        $user = auth()->user();
        $brands = Brand::where('owner_id', $user->id)
            ->where('status', 'approved')
            ->get();

        return view('brand.campaigns.create', compact('brands'));
    }

    public function store(StoreCampaignRequest $request)
    {
        $user = auth()->user();

        $brand = Brand::where('id', $request->brand_id)
            ->where('owner_id', $user->id)
            ->first();

        if (!$brand) {
            return back()->with('error', 'Brand tidak ditemukan atau bukan milik Anda.');
        }

        $data = $request->validated();
        $data['created_by'] = $user->id;
        $data['status'] = 'draft';

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('campaigns/images', 'public');
        }

        $campaign = Campaign::create($data);

        return redirect()->route('brand.campaigns.show', $campaign)
            ->with('success', 'Campaign berhasil dibuat.');
    }

    public function show(Campaign $campaign)
    {
        $campaign->load('brand', 'creator');

        $user = auth()->user();
        $brand = $campaign->brand;

        if (!$brand->isOwnedBy($user) && !$user->hasRole('superadmin')) {
            abort(403);
        }

        return view('brand.campaigns.show', compact('campaign'));
    }

    public function edit(Campaign $campaign)
    {
        $user = auth()->user();
        $brand = $campaign->brand;

        if (!$brand->isOwnedBy($user) && !$user->hasRole('superadmin')) {
            abort(403);
        }

        $brands = Brand::where('owner_id', $user->id)
            ->where('status', 'approved')
            ->get();

        return view('brand.campaigns.edit', compact('campaign', 'brands'));
    }

    public function update(UpdateCampaignRequest $request, Campaign $campaign)
    {
        $user = auth()->user();
        $brand = $campaign->brand;

        if (!$brand->isOwnedBy($user) && !$user->hasRole('superadmin')) {
            abort(403);
        }

        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($campaign->image) {
                Storage::disk('public')->delete($campaign->image);
            }
            $data['image'] = $request->file('image')->store('campaigns/images', 'public');
        }

        $campaign->update($data);

        return redirect()->route('brand.campaigns.show', $campaign)
            ->with('success', 'Campaign berhasil diperbarui.');
    }

    public function destroy(Campaign $campaign)
    {
        $user = auth()->user();
        $brand = $campaign->brand;

        if (!$brand->isOwnedBy($user) && !$user->hasRole('superadmin')) {
            abort(403);
        }

        $campaign->delete();

        return redirect()->route('brand.campaigns.index')
            ->with('success', 'Campaign berhasil dihapus.');
    }
}
