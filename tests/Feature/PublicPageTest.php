<?php

namespace Tests\Feature;

use Tests\TestCase;

class PublicPageTest extends TestCase
{

    public function test_homepage_loads(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_about_page_loads(): void
    {
        $response = $this->get('/about');
        $response->assertStatus(200);
    }

    public function test_contact_page_loads(): void
    {
        $response = $this->get('/contact');
        $response->assertStatus(200);
    }

    public function test_blogs_page_loads(): void
    {
        $response = $this->get('/blogs');
        $response->assertStatus(200);
    }

    public function test_communities_page_loads(): void
    {
        $response = $this->get('/komunitas');
        $response->assertStatus(200);
    }

    public function test_events_page_loads(): void
    {
        $response = $this->get('/events');
        $response->assertStatus(200);
    }

    public function test_account_restricted_page_loads(): void
    {
        $response = $this->get('/account-restricted');
        $response->assertStatus(200);
    }

    public function test_public_pages_not_500(): void
    {
        $pages = ['/', '/about', '/contact', '/blogs', '/komunitas', '/events'];

        foreach ($pages as $page) {
            $response = $this->get($page);
            $response->assertStatus(200, "Page {$page} returned status " . $response->getStatusCode());
        }
    }
}
