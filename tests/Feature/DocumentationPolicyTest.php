<?php

namespace Tests\Feature;

use App\Models\DocumentationFile;
use App\Models\User;
use App\Policies\DocumentationPolicy;
use Tests\TestCase;

class DocumentationPolicyTest extends TestCase
{
    private function policy(): DocumentationPolicy
    {
        return new DocumentationPolicy();
    }

    public function test_superadmin_can_view_any(): void
    {
        $u = User::factory()->create();
        $u->assignRole('superadmin');
        $this->assertTrue($this->policy()->viewAny($u));
    }

    public function test_platform_admin_can_view_any(): void
    {
        $u = User::factory()->create();
        $u->assignRole('platform_admin');
        $this->assertTrue($this->policy()->viewAny($u));
    }

    public function test_member_cannot_view_any(): void
    {
        $u = User::factory()->create();
        $u->assignRole('member');
        $this->assertFalse($this->policy()->viewAny($u));
    }

    public function test_platform_admin_can_generate(): void
    {
        $u = User::factory()->create();
        $u->assignRole('platform_admin');
        $this->assertTrue($this->policy()->generate($u));
    }

    public function test_member_cannot_generate(): void
    {
        $u = User::factory()->create();
        $u->assignRole('member');
        $this->assertFalse($this->policy()->generate($u));
    }

    public function test_superadmin_can_download(): void
    {
        $u = User::factory()->create();
        $u->assignRole('superadmin');
        $file = DocumentationFile::factory()->create();
        $this->assertTrue($this->policy()->download($u, $file));
    }

    public function test_only_superadmin_can_delete(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('platform_admin');
        $file = DocumentationFile::factory()->create();
        $this->assertFalse($this->policy()->delete($admin, $file));

        $super = User::factory()->create();
        $super->assignRole('superadmin');
        $this->assertTrue($this->policy()->delete($super, $file));
    }

    public function test_member_cannot_view_specific_file(): void
    {
        $u = User::factory()->create();
        $u->assignRole('member');
        $file = DocumentationFile::factory()->create();
        $this->assertFalse($this->policy()->view($u, $file));
    }
}
