<?php

namespace Tests\Feature;

use Tests\TestCase;

class DocumentationGeneratorTest extends TestCase
{

    private function createSuperadmin(): \App\Models\User
    {
        $user = \App\Models\User::factory()->create();
        $user->assignRole('superadmin');
        return $user;
    }

    public function test_documentation_dashboard_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/documentation');
        $response->assertStatus(200);
    }

    public function test_generate_index_page_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/documentation/generate');
        $response->assertStatus(200);
    }

    public function test_route_inventory_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/documentation/tools/routes');
        $response->assertStatus(200);
    }

    public function test_database_inventory_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/documentation/tools/database');
        $response->assertStatus(200);
    }

    public function test_member_cannot_access_documentation(): void
    {
        $user = \App\Models\User::factory()->create();
        $user->assignRole('member');
        $this->actingAs($user);

        $response = $this->get('/superadmin/documentation');
        $response->assertStatus(403);
    }

    public function test_documentation_model_factory_works(): void
    {
        $doc = \App\Models\DocumentationFile::factory()->create();
        $this->assertDatabaseHas('documentation_files', ['id' => $doc->id]);
    }
}
