<?php

namespace Database\Factories\AdminChat;

use App\Models\AdminChat\AdminConversation;
use App\Models\Identity\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdminConversationFactory extends Factory
{
    protected $model = \App\Models\AdminChat\AdminConversation::class;

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
