<?php

namespace Database\Factories\Identity;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'status' => 'active',
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function banned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'banned',
            'banned_at' => now(),
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspended',
        ]);
    }

    public function superadmin(): static
    {
        return $this->state(function (array $attributes) {
            return function (\App\Models\Identity\User $user) {
                $user->assignRole('superadmin');
            };
        });
    }

    public function platformAdmin(): static
    {
        return $this->state(function (array $attributes) {
            return function (\App\Models\Identity\User $user) {
                $user->assignRole('platform_admin');
            };
        });
    }

    public function member(): static
    {
        return $this->state(function (array $attributes) {
            return function (\App\Models\Identity\User $user) {
                $user->assignRole('member');
            };
        });
    }

    public function communityOwner(): static
    {
        return $this->state(function (array $attributes) {
            return function (\App\Models\Identity\User $user) {
                $user->assignRole('community_owner');
            };
        });
    }

    public function brandOwner(): static
    {
        return $this->state(function (array $attributes) {
            return function (\App\Models\Identity\User $user) {
                $user->assignRole('brand_owner');
            };
        });
    }

    public function companyOwner(): static
    {
        return $this->state(function (array $attributes) {
            return function (\App\Models\Identity\User $user) {
                $user->assignRole('company_owner');
            };
        });
    }
}
