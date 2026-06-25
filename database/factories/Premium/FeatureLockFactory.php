<?php

namespace Database\Factories\Premium;

use App\Models\Premium\FeatureLock;
use Illuminate\Database\Eloquent\Factories\Factory;

class FeatureLockFactory extends Factory
{
    protected $model = \App\Models\Premium\FeatureLock::class;

    public function definition(): array
    {
        return [
            'feature_key' => fake()->unique()->slug(),
            'feature_name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'is_premium' => true,
            'is_trial_available' => true,
            'is_enabled' => true,
        ];
    }
}
