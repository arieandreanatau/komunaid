<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Make sure tests are isolated to the testing DB.
        if (! User::where('email', 'authflow-member@komuna.test')->exists()) {
            User::create([
                'name' => 'AuthFlow Member',
                'email' => 'authflow-member@komuna.test',
                'username' => 'authflow_member',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]);
        }
    }

    public function test_login_with_valid_credentials(): void
    {
        $response = $this->post('/login', [
            'login' => 'authflow-member@komuna.test',
            'password' => 'password',
        ]);
        $response->assertStatus(302);
        $this->assertAuthenticated();
    }

    public function test_login_with_invalid_password(): void
    {
        $response = $this->post('/login', [
            'login' => 'authflow-member@komuna.test',
            'password' => 'wrong',
        ]);
        $response->assertStatus(302);
        $response->assertSessionHasErrors('login');
        $this->assertGuest();
    }

    public function test_login_with_unknown_email(): void
    {
        $response = $this->post('/login', [
            'login' => 'nobody@example.test',
            'password' => 'password',
        ]);
        $response->assertStatus(302);
        $response->assertSessionHasErrors('login');
        $this->assertGuest();
    }

    public function test_logout_clears_session(): void
    {
        $user = User::where('email', 'authflow-member@komuna.test')->first();
        $this->actingAs($user);

        $response = $this->post('/logout');
        $response->assertStatus(302);
        $this->assertGuest();
    }
}
