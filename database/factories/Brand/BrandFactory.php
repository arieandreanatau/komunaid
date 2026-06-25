<?php

namespace Database\Factories\Brand;

use App\Models\Brand\Brand;
use App\Models\Identity\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BrandFactory extends Factory
{
    protected $model = \App\Models\Brand\Brand::class;

    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'owner_id' => User::factory(),
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name),
            'description' => fake()->paragraph(),
            'industry' => fake()->jobTitle(),
            'status' => 'active',
            'is_verified' => false,
            'is_featured' => false,
        ];
    }
}
