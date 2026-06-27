<?php

namespace App\Shims;

use Illuminate\Database\Eloquent\Factories\Factory;

class ProfileFactoryShim extends Factory
{
    protected $model = \App\Models\Profile::class;

    public function definition(): array
    {
        return [
            "bio" => fake()->sentence(),
            "location" => fake()->city(),
        ];
    }
}