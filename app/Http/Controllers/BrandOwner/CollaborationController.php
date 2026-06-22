<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\BrandOwner\StoreCollaborationRequest;
use App\Models\Brand;
use App\Models\CollaborationRequest;
use App\Models\Community;
use Illuminate\Http\Request;

class CollaborationController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $brandIds = Brand::where('owner_id', $user->id)->pluck('id');

        $query = CollaborationRequest::whereIn('brand_id', $brandIds)
            ->with('brand', 'community');

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $collaborations = $query->latest()->paginate(10);

        return view('brand.collaborations.index', compact('collaborations'));
    }

    public function create(Request $request)
    {
        $user = auth()->user();
        $brands = Brand::where('owner_id', $user->id)
            ->where('status', 'approved')
            ->get();

        $communities = Community::where('status', 'approved')
            ->latest()
            ->get();

        $selectedCommunity = $request->query('community_id');

        return view('brand.collaborations.create', compact('brands', 'communities', 'selectedCommunity'));
    }

    public function store(StoreCollaborationRequest $request)
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
        $data['status'] = 'pending';

        CollaborationRequest::create($data);

        return redirect()->route('brand.collaborations.index')
            ->with('success', 'Collaboration request berhasil dikirim ke komunitas. Menunggu response dari community owner.');
    }

    public function show(CollaborationRequest $collaboration)
    {
        $collaboration->load('brand', 'community', 'creator');

        $user = auth()->user();
        $brand = $collaboration->brand;

        if (!$brand->isOwnedBy($user) && !$user->hasRole('superadmin')) {
            abort(403);
        }

        return view('brand.collaborations.show', compact('collaboration'));
    }

    public function destroy(CollaborationRequest $collaboration)
    {
        $user = auth()->user();
        $brand = $collaboration->brand;

        if (!$brand->isOwnedBy($user) && !$user->hasRole('superadmin')) {
            abort(403);
        }

        if ($collaboration->status !== 'pending') {
            return back()->with('error', 'Hanya collaboration request dengan status pending yang bisa dibatalkan.');
        }

        $collaboration->update(['status' => 'cancelled']);

        return redirect()->route('brand.collaborations.index')
            ->with('success', 'Collaboration request berhasil dibatalkan.');
    }
}
