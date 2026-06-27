<?php

namespace Tests\Feature;

use Tests\TestCase;

class LanguageSwitcherTest extends TestCase
{
    public function test_language_switch_route_is_registered(): void
    {
        $this->assertNotNull(
            \Illuminate\Support\Facades\Route::getRoutes()->getByName('language.switch'),
            'Route [language.switch] is not registered.'
        );
    }

    public function test_switching_to_id_persists_locale_in_session(): void
    {
        $response = $this->get('/language/id');
        $response->assertRedirect();
        $this->assertEquals('id', session('locale'));
    }

    public function test_switching_to_en_persists_locale_in_session(): void
    {
        $response = $this->get('/language/en');
        $response->assertRedirect();
        $this->assertEquals('en', session('locale'));
    }

    public function test_unsupported_locale_returns_404(): void
    {
        $response = $this->get('/language/ja');
        $response->assertStatus(404);
    }

    public function test_translation_files_have_matching_keys(): void
    {
        $idKeys = array_keys(require lang_path('id/messages.php'));
        $enKeys = array_keys(require lang_path('en/messages.php'));

        sort($idKeys);
        sort($enKeys);

        $this->assertEquals(
            $idKeys,
            $enKeys,
            'Translation key mismatch between lang/id/messages.php and lang/en/messages.php'
        );
    }
}
