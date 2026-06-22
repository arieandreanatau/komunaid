<?php

namespace App\Http\Requests\Member;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requested_role' => ['required', 'string', 'in:community_owner,brand_owner'],
        ];
    }

    public function messages(): array
    {
        return [
            'requested_role.in' => 'Role yang dipilih tidak valid. Pilih community_owner atau brand_owner.',
        ];
    }
}
