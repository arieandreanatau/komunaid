<?php

namespace App\Http\Requests\CommunityOwner;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubgroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'parent_id' => ['nullable', 'exists:community_subgroups,id'],
        ];
    }
}
