<?php

namespace App\Shims;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactoryShim extends Factory
{
    protected $model = \App\Models\User::class;

    public function definition(): array
    {
        return [
            "name" => fake()->name(),
            "username" => fake()->unique()->userName(),
            "email" => fake()->unique()->safeEmail(),
            "email_verified_at" => now(),
            "password" => Hash::make("password"),
            "remember_token" => Str::random(10),
            "status" => "active",
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            "email_verified_at" => null,
        ]);
    }
}