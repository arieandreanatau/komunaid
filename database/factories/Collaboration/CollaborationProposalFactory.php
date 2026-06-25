<?php

namespace Database\Factories\Collaboration;

use App\Models\Collaboration\CollaborationProposal;
use App\Models\Identity\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CollaborationProposalFactory extends Factory
{
    protected $model = \App\Models\Collaboration\CollaborationProposal::class;

    public function definition(): array
    {
        return [
            'proposer_type' => 'brand',
            'proposer_id' => 1,
            'target_type' => 'community',
            'target_id' => 1,
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'status' => 'draft',
            'created_by' => User::factory(),
        ];
    }
}
