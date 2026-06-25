<?php

namespace App\Http\Requests\BrandOwner;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCollaborationProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['brand_owner', 'company_owner', 'superadmin']);
    }

    public function rules(): array
    {
        return [
            'collaboration_type_id' => 'nullable|exists:collaboration_types,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'objective' => 'nullable|string|max:1000',
            'target_audience' => 'nullable|string|max:1000',
            'benefit_for_brand' => 'nullable|string|max:1000',
            'benefit_for_community' => 'nullable|string|max:1000',
            'estimated_budget' => 'nullable|numeric|min:0',
            'timeline' => 'nullable|string|max:1000',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,webp|max:4096',
        ];
    }
}
