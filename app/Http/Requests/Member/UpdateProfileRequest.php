<?php

namespace App\Http\Requests\Member;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'display_name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'username' => ['sometimes', 'nullable', 'string', 'max:50', 'alpha_dash', 'unique:users,username,' . $userId],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', 'unique:users,email,' . $userId],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'gender' => ['sometimes', 'nullable', 'string', 'max:50'],
            'birthdate' => ['sometimes', 'nullable', 'date'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'province' => ['sometimes', 'nullable', 'string', 'max:100'],
            'country' => ['sometimes', 'nullable', 'string', 'max:100'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'instagram_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'linkedin_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'website_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'privacy' => ['sometimes', 'required', 'in:public,friends,private'],
            'profile_photo' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }
}
