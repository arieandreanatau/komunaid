<?php

namespace Tests\Feature;

use App\Models\FeatureLock;
use App\Models\User;
use Tests\TestCase;

class PremiumFeatureTest extends TestCase
{

    private function createSuperadmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('superadmin');
        return $user;
    }

    public function test_feature_lock_model_can_be_created(): void
    {
        $feature = FeatureLock::factory()->create([
            'feature_key' => 'test_feature',
            'feature_name' => 'Test Feature',
            'is_premium' => true,
            'is_enabled' => true,
        ]);

        $this->assertDatabaseHas('feature_locks', ['feature_key' => 'test_feature']);
        $this->assertTrue($feature->is_premium);
    }

    public function test_feature_lock_factory_works(): void
    {
        $feature = FeatureLock::factory()->create();

        $this->assertDatabaseHas('feature_locks', ['id' => $feature->id]);
    }

    public function test_superadmin_can_access_documentation(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/documentation');
        $response->assertStatus(200);
    }

    public function test_member_cannot_access_documentation(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        $this->actingAs($user);

        $response = $this->get('/superadmin/documentation');
        $response->assertStatus(403);
    }
}
