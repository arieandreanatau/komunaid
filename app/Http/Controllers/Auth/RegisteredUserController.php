<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RegisteredUserController extends Controller
{
    public function create()
    {
        return view('auth.register');
    }

    public function store(RegisterRequest $request)
    {
        $validated = $request->validated();

        $name = $validated['name'] ?? null;
        $username = $validated['username'] ?? null;
        $email = $validated['email'] ?? null;

        if (!$name) {
            if ($username) {
                $name = $username;
            } elseif ($email) {
                $name = explode('@', $email)[0];
            }
        }

        $user = User::create([
            'name' => $name,
            'username' => $username,
            'email' => $email,
            'password' => Hash::make($validated['password']),
            'status' => 'active',
        ]);

        if (class_exists(Profile::class)) {
            Profile::create([
                'user_id' => $user->id,
                'username' => $username,
                'display_name' => $name,
            ]);
        }

        $role = Role::where('name', 'member')->first();
        if ($role) {
            $user->assignRole($role);
        }

        Auth::login($user);

        return redirect()->route('onboarding');
    }
}
