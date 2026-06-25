<?php

namespace App\Http\Requests\CommunityOwner;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'title' => ['sometimes', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:5000'],
            'type_id' => ['nullable', 'exists:event_types,id'],
            'banner_path' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'event_type' => ['sometimes', 'in:free,paid,collaboration,volunteer,charity'],
            'location_type' => ['sometimes', 'in:online,offline,hybrid'],
            'location_name' => ['nullable', 'string', 'max:255'],
            'location_address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'online_url' => ['nullable', 'string', 'max:500'],
            'start_datetime' => ['sometimes', 'date'],
            'end_datetime' => ['nullable', 'date', 'after_or_equal:start_datetime'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'registration_type' => ['sometimes', 'in:open,approval_required,invite_only'],
            'registration_status' => ['sometimes', 'in:open,closed'],
            'visibility' => ['sometimes', 'in:public,private'],
            'is_charity' => ['sometimes', 'boolean'],
            'is_open_volunteer' => ['sometimes', 'boolean'],
            'is_open_donation' => ['sometimes', 'boolean'],
            'discount_enabled' => ['sometimes', 'boolean'],
            'discount_type' => ['nullable', 'in:percentage,fixed'],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'eo_by_platform' => ['sometimes', 'boolean'],
            'eo_fee' => ['nullable', 'numeric', 'min:0'],
            'platform_fee' => ['nullable', 'numeric', 'min:0'],
            'admin_fee' => ['nullable', 'numeric', 'min:0'],
        ];

        return $rules;
    }
}
