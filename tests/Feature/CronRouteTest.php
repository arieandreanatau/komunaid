<?php

namespace Tests\Feature;

use Tests\TestCase;

class CronRouteTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['app.cron_secret' => 'test-secret-1234567890']);
    }

    public function test_cron_route_without_token_returns_403(): void
    {
        $response = $this->get('/api/cron/scheduler');
        $response->assertStatus(403);
        $response->assertJson(['error' => 'Invalid cron token.']);
    }

    public function test_cron_route_with_invalid_token_returns_403(): void
    {
        $response = $this->get('/api/cron/scheduler?token=wrong-token');
        $response->assertStatus(403);
    }

    public function test_cron_route_with_bearer_token_returns_403_if_wrong(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer wrong-token',
        ])->get('/api/cron/scheduler');
        $response->assertStatus(403);
    }

    public function test_cron_route_returns_503_when_secret_not_configured(): void
    {
        config(['app.cron_secret' => null]);
        config(['app.cron_secret_fallback' => null]);

        $response = $this->get('/api/cron/scheduler?token=anything');
        $response->assertStatus(503);
    }

    public function test_cron_route_with_correct_query_token_executes(): void
    {
        $response = $this->get('/api/cron/scheduler?token=test-secret-1234567890');
        $response->assertStatus(200);
        $response->assertJsonStructure(['ok', 'ran_at']);
        $this->assertTrue($response->json('ok'));
    }

    public function test_cron_route_with_correct_bearer_token_executes(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer test-secret-1234567890',
        ])->get('/api/cron/scheduler');
        $response->assertStatus(200);
        $response->assertJsonStructure(['ok', 'ran_at']);
    }
}
