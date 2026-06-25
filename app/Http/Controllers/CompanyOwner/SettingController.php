<?php

namespace App\Http\Controllers\CompanyOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function profile()
    {
        $user = auth()->user();

        return view('company-owner.settings.profile', compact('user'));
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:30',
        ]);

        $user->update($request->only(['name', 'email', 'phone']));

        return back()->with('success', 'Profile berhasil diperbarui.');
    }
}
