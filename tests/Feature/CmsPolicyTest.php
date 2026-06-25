<?php

namespace Tests\Feature;

use App\Models\Blog;
use App\Models\User;
use App\Policies\CmsPolicy;
use Tests\TestCase;

class CmsPolicyTest extends TestCase
{
    private function policy(): CmsPolicy
    {
        return new CmsPolicy();
    }

    private function makeBlog(): Blog
    {
        $author = User::factory()->create();
        return Blog::create([
            'author_id' => $author->id,
            'title' => 'Test Blog ' . uniqid(),
            'slug' => 'test-blog-' . uniqid(),
            'content' => 'Content',
            'status' => 'draft',
        ]);
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

    public function test_superadmin_can_create(): void
    {
        $u = User::factory()->create();
        $u->assignRole('superadmin');
        $this->assertTrue($this->policy()->create($u));
    }

    public function test_member_cannot_create(): void
    {
        $u = User::factory()->create();
        $u->assignRole('member');
        $this->assertFalse($this->policy()->create($u));
    }

    public function test_platform_admin_can_publish(): void
    {
        $u = User::factory()->create();
        $u->assignRole('platform_admin');
        $blog = $this->makeBlog();
        $this->assertTrue($this->policy()->publish($u, $blog));
    }

    public function test_only_superadmin_can_delete(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('platform_admin');
        $blog = $this->makeBlog();
        $this->assertFalse($this->policy()->delete($admin, $blog));

        $super = User::factory()->create();
        $super->assignRole('superadmin');
        $this->assertTrue($this->policy()->delete($super, $blog));
    }

    public function test_member_cannot_update(): void
    {
        $u = User::factory()->create();
        $u->assignRole('member');
        $blog = $this->makeBlog();
        $this->assertFalse($this->policy()->update($u, $blog));
    }
}
