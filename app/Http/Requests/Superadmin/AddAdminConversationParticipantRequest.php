<?php

namespace App\Http\Requests\Superadmin;

use Illuminate\Foundation\Http\FormRequest;

class AddAdminConversationParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $userId = $this->input('user_id');
            if ($userId) {
                $user = \App\Models\User::find($userId);
                if ($user && $user->isBannedOrSuspended()) {
                    $validator->errors()->add('user_id', 'User ini tidak bisa ditambahkan karena akun dibanned/ditangguhkan.');
                }
                if ($user && !$user->hasRole('superadmin') && !$user->hasRole('platform_admin')) {
                    $validator->errors()->add('user_id', 'Hanya admin platform yang bisa ditambahkan.');
                }
            }
        });
    }
}
