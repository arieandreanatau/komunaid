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
            'description' => ['nullable', 'string', 'max:5000'],
            'event_type' => ['sometimes', 'in:free,paid,collaboration'],
            'location_type' => ['sometimes', 'in:online,offline,hybrid'],
            'location_address' => ['nullable', 'string', 'max:500'],
            'start_datetime' => ['sometimes', 'date'],
            'end_datetime' => ['sometimes', 'date', 'after_or_equal:start_datetime'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'registration_status' => ['sometimes', 'in:open,closed'],
            'visibility' => ['sometimes', 'in:public,private'],
            'discount_enabled' => ['sometimes', 'boolean'],
            'discount_type' => ['nullable', 'in:percentage,fixed'],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'eo_by_platform' => ['sometimes', 'boolean'],
            'eo_fee' => ['nullable', 'numeric', 'min:0'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'platform_fee' => ['nullable', 'numeric', 'min:0'],
            'admin_fee' => ['nullable', 'numeric', 'min:0'],
        ];

        return $rules;
    }
}
