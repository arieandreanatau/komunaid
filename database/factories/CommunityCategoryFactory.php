<?php

namespace Database\Factories;

use App\Models\CommunityCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommunityCategoryFactory extends Factory
{
    protected $model = CommunityCategory::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'slug' => fake()->unique()->slug(),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
