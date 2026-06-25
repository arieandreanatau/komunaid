<?php

namespace App\Shims;

use Illuminate\Database\Eloquent\Factories\Factory;

class AdminConversationFactoryShim extends Factory
{
    protected $model = \App\Models\AdminConversation::class;

    public function definition(): array
    {
        return [
            "title" => fake()->sentence(4),
            "type" => "direct",
            "status" => "active",
            "last_message_at" => now(),
        ];
    }
}