<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index()
    {
        $brands = auth()->user()->ownedBrands()->withCount('activeMembers')->latest()->paginate(10);
        return view('brand-owner.brands.index', compact('brands'));
    }

    public function create()
    {
        return view('brand-owner.brands.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'industry' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'instagram' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'logo' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,webp|max:4096',
        ]);

        $validated['owner_id'] = auth()->id();
        $validated['status'] = 'pending';

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('brands', 'public');
        }
        if ($request->hasFile('banner')) {
            $validated['banner'] = $request->file('banner')->store('brands', 'public');
        }

        Brand::create($validated);

        return redirect()->route('brand-owner.brands.index')
            ->with('success', 'Brand berhasil dibuat. Menunggu approval superadmin.');
    }

    public function show(Brand $brand)
    {
        $this->authorizeBrand($brand);

        $brand->load('activeMembers.user', 'campaigns', 'collaborations');

        $stats = [
            'total_staff' => $brand->activeMembers()->count(),
            'total_campaigns' => $brand->campaigns()->count(),
            'active_campaigns' => $brand->campaigns()->where('status', 'active')->count(),
            'total_collaborations' => $brand->collaborations()->count(),
            'pending_collaborations' => $brand->collaborations()->where('status', 'pending')->count(),
        ];

        return view('brand-owner.brands.show', compact('brand', 'stats'));
    }

    public function edit(Brand $brand)
    {
        $this->authorizeBrand($brand);
        return view('brand-owner.brands.edit', compact('brand'));
    }

    public function update(Request $request, Brand $brand)
    {
        $this->authorizeBrand($brand);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'industry' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'instagram' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'logo' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,webp|max:4096',
        ]);

        if ($request->hasFile('logo')) {
            if ($brand->logo) {
                Storage::disk('public')->delete($brand->logo);
            }
            $validated['logo'] = $request->file('logo')->store('brands', 'public');
        }
        if ($request->hasFile('banner')) {
            if ($brand->banner) {
                Storage::disk('public')->delete($brand->banner);
            }
            $validated['banner'] = $request->file('banner')->store('brands', 'public');
        }

        $brand->update($validated);

        return redirect()->route('brand-owner.brands.show', $brand)
            ->with('success', 'Brand berhasil diupdate.');
    }

    public function destroy(Brand $brand)
    {
        $this->authorizeBrand($brand);
        $brand->delete();

        return redirect()->route('brand-owner.brands.index')
            ->with('success', 'Brand berhasil dihapus.');
    }

    private function authorizeBrand(Brand $brand): void
    {
        if ($brand->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }
    }
}
