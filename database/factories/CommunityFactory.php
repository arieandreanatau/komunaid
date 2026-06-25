<?php

namespace Database\Factories;

use App\Models\Community;
use App\Models\CommunityCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommunityFactory extends Factory
{
    protected $model = Community::class;

    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'category_id' => CommunityCategory::factory(),
            'owner_id' => User::factory(),
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name),
            'description' => fake()->paragraph(),
            'short_description' => fake()->sentence(),
            'community_type' => 'organization',
            'location_type' => 'offline',
            'visibility' => 'public',
            'status' => 'active',
            'is_public' => true,
            'city' => fake()->city(),
            'province' => fake()->state(),
            'member_count' => 0,
            'is_recommended' => false,
            'is_featured' => false,
        ];
    }

    public function private(): static
    {
        return $this->state(fn () => [
            'visibility' => 'private',
            'is_public' => false,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'status' => 'inactive',
        ]);
    }
}
