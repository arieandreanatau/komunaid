<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\RoleRequest;
use Illuminate\Http\Request;

class RoleRequestController extends Controller
{
    public function create()
    {
        $existingRequest = RoleRequest::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->first();

        return view('member.role-request.create', compact('existingRequest'));
    }

    public function store(Request $request)
    {
        $existingRequest = RoleRequest::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return redirect()->back()->with('error', 'Anda sudah memiliki pengajuan yang pending.');
        }

        $validated = $request->validate([
            'requested_role' => 'required|in:community_owner,brand_owner',
            'reason' => 'required|string|min:10|max:1000',
            'evidence' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
        ]);

        if ($request->hasFile('evidence')) {
            $validated['evidence'] = $request->file('evidence')->store('role-requests', 'public');
        }

        $validated['user_id'] = auth()->id();

        RoleRequest::create($validated);

        return redirect()->route('member.role-request.create')
            ->with('success', 'Pengajuan role berhasil dikirim. Menunggu review dari superadmin.');
    }

    public function status()
    {
        $requests = RoleRequest::where('user_id', auth()->id())->latest()->get();
        return view('member.role-request.status', compact('requests'));
    }
}
