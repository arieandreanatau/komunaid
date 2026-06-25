<?php

namespace App\Shims;

use Illuminate\Database\Eloquent\Factories\Factory;

class AdminConversationFactoryShim extends Factory
{
    protected $model = \App\Models\AdminConversation::class;

    public function definition(): array
    {
        return [
            "subject" => fake()->sentence(4),
            "status" => "open",
            "last_message_at" => now(),
        ];
    }
}