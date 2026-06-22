<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\BrandOwner\StoreBrandRequest;
use App\Http\Requests\BrandOwner\UpdateBrandRequest;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BrandController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $brands = Brand::where('owner_id', $user->id)
            ->with('activeMembers')
            ->latest()
            ->paginate(10);

        return view('brand.brands.index', compact('brands'));
    }

    public function create()
    {
        return view('brand.brands.create');
    }

    public function store(StoreBrandRequest $request)
    {
        $user = auth()->user();
        $data = $request->validated();
        $data['owner_id'] = $user->id;
        $data['status'] = 'pending';

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('brands/logos', 'public');
        }

        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('brands/banners', 'public');
        }

        $brand = Brand::create($data);

        return redirect()->route('brand.brands.show', $brand)
            ->with('success', 'Brand berhasil dibuat! Status saat ini: Pending. Menunggu approval superadmin.');
    }

    public function show(Brand $brand)
    {
        $this->authorize('view', $brand);

        $brand->load('activeMembers.user.profile', 'campaigns', 'collaborationRequests');

        $stats = [
            'total_staff' => $brand->activeMembers()->count(),
            'total_campaigns' => $brand->campaigns()->count(),
            'active_campaigns' => $brand->campaigns()->where('status', 'active')->count(),
            'total_collaborations' => $brand->collaborationRequests()->count(),
            'pending_collaborations' => $brand->collaborationRequests()->where('status', 'pending')->count(),
        ];

        return view('brand.brands.show', compact('brand', 'stats'));
    }

    public function edit(Brand $brand)
    {
        $this->authorize('update', $brand);

        return view('brand.brands.edit', compact('brand'));
    }

    public function update(UpdateBrandRequest $request, Brand $brand)
    {
        $this->authorize('update', $brand);

        $data = $request->validated();

        if ($request->hasFile('logo')) {
            if ($brand->logo) {
                Storage::disk('public')->delete($brand->logo);
            }
            $data['logo'] = $request->file('logo')->store('brands/logos', 'public');
        }

        if ($request->hasFile('banner')) {
            if ($brand->banner) {
                Storage::disk('public')->delete($brand->banner);
            }
            $data['banner'] = $request->file('banner')->store('brands/banners', 'public');
        }

        $brand->update($data);

        return redirect()->route('brand.brands.show', $brand)
            ->with('success', 'Brand berhasil diperbarui.');
    }

    public function destroy(Brand $brand)
    {
        $this->authorize('delete', $brand);

        $brand->delete();

        return redirect()->route('brand.brands.index')
            ->with('success', 'Brand berhasil dihapus.');
    }
}
