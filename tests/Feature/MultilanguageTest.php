<?php

namespace Tests\Feature;

use Tests\TestCase;

class MultilanguageTest extends TestCase
{

    public function test_default_locale_is_indonesian(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);

        $this->assertEquals('id', app()->getLocale());
    }

    public function test_invalid_locale_does_not_cause_500(): void
    {
        $response = $this->get('/?lang=xyz');
        $this->assertNotEquals(500, $response->getStatusCode());
    }

    public function test_switch_to_english(): void
    {
        $response = $this->get('/?lang=en');
        $response->assertStatus(200);
    }

    public function test_switch_to_sunda(): void
    {
        $response = $this->get('/?lang=su');
        $response->assertStatus(200);
    }

    public function test_about_page_multilanguage(): void
    {
        $response = $this->get('/about');
        $response->assertStatus(200);
    }

    public function test_contact_page_multilanguage(): void
    {
        $response = $this->get('/contact');
        $response->assertStatus(200);
    }
}
