<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'owner_id' => User::factory(),
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name),
            'legal_name' => $name,
            'industry' => fake()->jobTitle(),
            'description' => fake()->paragraph(),
            'status' => 'active',
            'is_verified' => false,
        ];
    }
}
