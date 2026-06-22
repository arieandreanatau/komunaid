<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $query = Brand::with('owner');

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $brands = $query->latest()->paginate(15);

        return view('superadmin.brands.index', compact('brands'));
    }

    public function approve(Brand $brand)
    {
        $brand->update(['status' => 'approved']);
        return redirect()->back()->with('success', 'Brand berhasil di-approve.');
    }

    public function reject(Brand $brand)
    {
        $brand->update(['status' => 'rejected']);
        return redirect()->back()->with('success', 'Brand berhasil ditolak.');
    }
}
