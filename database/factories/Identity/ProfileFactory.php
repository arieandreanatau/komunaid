<?php

namespace Database\Factories\Identity;

use App\Models\Identity\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'username' => fake()->unique()->userName(),
            'bio' => fake()->sentence(),
            'phone' => fake()->phoneNumber(),
            'city' => fake()->city(),
            'province' => fake()->state(),
            'interest' => fake()->words(3, true),
        ];
    }
}
