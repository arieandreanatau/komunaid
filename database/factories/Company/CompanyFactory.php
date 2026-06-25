<?php

namespace Database\Factories\Company;

use App\Models\Company\Company;
use App\Models\Identity\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyFactory extends Factory
{
    protected $model = \App\Models\Company\Company::class;

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
