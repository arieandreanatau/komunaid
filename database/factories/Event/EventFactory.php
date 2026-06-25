<?php

namespace Database\Factories\Event;

use App\Models\Event\Event;
use App\Models\Community\Community;
use App\Models\Identity\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    protected $model = \App\Models\Event\Event::class;

    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'community_id' => Community::factory(),
            'created_by' => User::factory(),
            'title' => $title,
            'slug' => \Illuminate\Support\Str::slug($title),
            'description' => fake()->paragraph(),
            'short_description' => fake()->sentence(),
            'event_type' => 'online',
            'location_type' => 'online',
            'start_datetime' => fake()->futureDate(),
            'end_datetime' => fake()->dateTimeBetween('+1 day', '+3 days'),
            'capacity' => fake()->numberBetween(10, 100),
            'price' => 0,
            'status' => 'published',
            'visibility' => 'public',
            'registration_status' => 'open',
            'approval_status' => 'auto',
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => [
            'status' => 'draft',
        ]);
    }

    public function private(): static
    {
        return $this->state(fn () => [
            'visibility' => 'private',
        ]);
    }
}
