<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingController extends Controller
{
    public function editProfile()
    {
        $user = auth()->user();

        return view('superadmin.settings.profile', compact('user'));
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        ]);

        $old = $user->only(['name', 'username', 'email']);
        $user->update($validated);

        AuditLog::log('superadmin_profile_updated', $user, 'Profil superadmin diperbarui', $old, $validated);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function editPassword()
    {
        return view('superadmin.settings.password');
    }

    public function updatePassword(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'current_password' => 'required',
            'password' => 'required|confirmed|min:8',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors(['current_password' => 'Password lama tidak sesuai.']);
        }

        $user->update(['password' => $validated['password']]);

        AuditLog::log('superadmin_password_changed', $user, 'Password superadmin diubah');

        return back()->with('success', 'Password berhasil diubah.');
    }

    public function resetDemoPasswords(Request $request)
    {
        try {
            $request->validate([
                'password' => 'required|string|min:4|max:255',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }

        $demoEmails = [
            'superadmin@komuna.test',
            'admin@komuna.test',
            'member@komuna.test',
            'community.owner@komuna.test',
            'brand.owner@komuna.test',
            'company.owner@komuna.test',
            'banned@komuna.test',
            'suspended@komuna.test',
        ];

        $count = 0;
        $emails = [];
        $hash = Hash::make($request->input('password'));
        foreach ($demoEmails as $email) {
            $u = User::where('email', $email)->first();
            if ($u) {
                $u->password = $hash;
                $u->save();
                $emails[] = $email;
                $count++;
            }
        }

        try {
            AuditLog::log(
                'demo_passwords_reset',
                auth()->user(),
                'Password akun demo di-reset',
                null,
                ['emails' => $emails, 'count' => $count]
            );
        } catch (\Throwable $e) {
            // never let audit log failure break the reset
        }

        return back()->with('success', "Password {$count} akun demo berhasil direset.");
    }
}
