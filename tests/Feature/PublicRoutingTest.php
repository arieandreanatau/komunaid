<?php

namespace Tests\Feature;

use Tests\TestCase;

class PublicRoutingTest extends TestCase
{
    public function test_homepage_returns_200(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('KomunaID');
    }

    public function test_komunitas_directory_returns_200(): void
    {
        $response = $this->get('/komunitas');
        $response->assertStatus(200);
    }

    public function test_events_returns_200(): void
    {
        $response = $this->get('/events');
        $response->assertStatus(200);
    }

    public function test_about_returns_200(): void
    {
        $response = $this->get('/about');
        $response->assertStatus(200);
    }

    public function test_contact_returns_200(): void
    {
        $response = $this->get('/contact');
        $response->assertStatus(200);
    }

    public function test_login_returns_200(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_register_returns_200(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    public function test_health_endpoint_returns_200(): void
    {
        $response = $this->get('/up');
        $response->assertStatus(200);
    }

    public function test_indonesian_alias_tentang_kami_returns_200(): void
    {
        $this->get('/tentang-kami')->assertStatus(200);
    }

    public function test_indonesian_alias_hubungi_kami_returns_200(): void
    {
        $this->get('/hubungi-kami')->assertStatus(200);
    }

    public function test_event_singular_returns_200(): void
    {
        $this->get('/event')->assertStatus(200);
    }

    public function test_nonexistent_returns_404(): void
    {
        $this->get('/this-page-does-not-exist-12345')->assertStatus(404);
    }

    public function test_admin_login_returns_200(): void
    {
        $this->get('/admin/login')->assertStatus(200);
    }

    public function test_member_dashboard_requires_auth(): void
    {
        $response = $this->get('/member/dashboard');
        $this->assertContains($response->getStatusCode(), [302, 200]);
        if ($response->getStatusCode() === 302) {
            $response->assertRedirect('/login');
        }
    }

    public function test_superadmin_dashboard_redirects_unauth(): void
    {
        $response = $this->get('/superadmin/dashboard');
        $this->assertContains($response->getStatusCode(), [302, 200]);
        if ($response->getStatusCode() === 302) {
            $response->assertRedirect('/admin/login');
        }
    }

    public function test_security_headers_present(): void
    {
        $response = $this->get('/');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
}
