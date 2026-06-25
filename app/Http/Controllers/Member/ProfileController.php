<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\UpdatePasswordRequest;
use App\Http\Requests\Member\UpdateProfileRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function edit()
    {
        $user = auth()->user();
        $user->load('profile');

        if (!$user->profile) {
            $user->profile = $user->profile()->create(['user_id' => $user->id]);
        }

        return view('member.profile', compact('user'));
    }

    public function update(UpdateProfileRequest $request)
    {
        $user = auth()->user();
        $data = $request->validated();

        if ($request->hasFile('profile_photo')) {
            if ($user->profile && $user->profile->profile_photo) {
                Storage::disk('public')->delete($user->profile->profile_photo);
            }
            $data['profile_photo'] = $request->file('profile_photo')->store('profile-photos', 'public');
        } else {
            unset($data['profile_photo']);
        }

        $userData = [];
        if ($request->has('name')) {
            $userData['name'] = $request->name;
        }
        if ($request->has('username')) {
            $userData['username'] = $request->username;
        }
        if ($request->has('email')) {
            $userData['email'] = $request->email;
        }
        if (!empty($userData)) {
            $user->update($userData);
        }

        $profileFields = [
            'display_name', 'bio', 'phone', 'city', 'province',
            'country', 'address', 'gender', 'date_of_birth', 'privacy',
            'instagram_url', 'linkedin_url', 'website_url', 'profile_photo',
        ];

        $profileData = array_intersect_key($data, array_flip($profileFields));

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        return redirect()->route('member.profile.edit')->with('success', 'Profile berhasil diupdate.');
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = auth()->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Password saat ini tidak cocok.']);
        }

        $user->update(['password' => $request->password]);

        return redirect()->route('member.profile.edit')->with('success', 'Password berhasil diupdate.');
    }

    public function deleteAvatar()
    {
        $user = auth()->user();

        if ($user->profile && $user->profile->profile_photo) {
            Storage::disk('public')->delete($user->profile->profile_photo);
            $user->profile->update(['profile_photo' => null]);
        }

        return back()->with('success', 'Foto profil berhasil dihapus.');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
