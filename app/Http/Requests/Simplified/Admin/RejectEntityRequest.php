<?php

declare(strict_types=1);

namespace App\Http\Requests\Simplified\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RejectEntityRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->hasRole('superadmin') || $user->hasRole('admin_platform'));
    }

    public function rules(): array
    {
        return [
            'rejection_reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
