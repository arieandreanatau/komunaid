<?php

namespace App\Http\Requests\RoleRequest;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\RequestedRole;

class StoreRoleRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'requested_role' => ['required', 'string', 'in:community_owner,brand_owner,company_owner'],
            'motivation' => ['nullable', 'string', 'max:2000'],
            'community_name' => ['nullable', 'string', 'max:255'],
            'community_category' => ['nullable', 'string', 'max:255'],
            'community_description' => ['nullable', 'string', 'max:2000'],
            'community_regional' => ['nullable', 'string', 'max:255'],
            'brand_name' => ['nullable', 'string', 'max:255'],
            'brand_industry' => ['nullable', 'string', 'max:255'],
            'brand_website' => ['nullable', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'company_industry' => ['nullable', 'string', 'max:255'],
            'company_website' => ['nullable', 'string', 'max:255'],
        ];

        return $rules;
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = $this->user();

            if ($user->isBannedOrSuspended()) {
                $validator->errors()->add('requested_role', 'Akun Anda sedang dibatasi.');
                return;
            }

            $requestedRole = $this->input('requested_role');

            if ($user->hasRole($requestedRole)) {
                $validator->errors()->add('requested_role', 'Anda sudah memiliki role ini.');
                return;
            }

            if ($user->hasPendingRoleRequest($requestedRole)) {
                $validator->errors()->add('requested_role', 'Anda sudah memiliki pengajuan role yang sedang diproses.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'requested_role.required' => 'Role wajib dipilih.',
            'requested_role.in' => 'Role yang dipilih tidak valid.',
        ];
    }
}
