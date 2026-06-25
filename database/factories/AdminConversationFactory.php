<?php

namespace Database\Factories;

use App\Models\AdminConversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdminConversationFactory extends Factory
{
    protected $model = AdminConversation::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'type' => 'group',
            'created_by' => User::factory(),
            'status' => 'active',
        ];
    }
}
