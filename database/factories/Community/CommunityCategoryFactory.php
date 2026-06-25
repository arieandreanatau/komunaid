<?php

namespace Database\Factories\Community;

use App\Models\Community\CommunityCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommunityCategoryFactory extends Factory
{
    protected $model = \App\Models\Community\CommunityCategory::class;

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
