<?php

namespace App\Http\Requests\CompanyOwner;

use Illuminate\Foundation\Http\FormRequest;

class StoreCollaborationProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['company_owner', 'brand_owner', 'superadmin']);
    }

    public function rules(): array
    {
        return [
            'proposer_type' => 'required|in:brand,company',
            'proposer_id' => 'required|integer',
            'target_type' => 'required|in:community',
            'target_id' => 'required|integer|exists:communities,id',
            'collaboration_type_id' => 'nullable|exists:collaboration_types,id',
            'title' => 'required|string|max:255',
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
