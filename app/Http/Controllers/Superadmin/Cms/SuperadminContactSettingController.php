<?php

namespace App\Http\Controllers\Superadmin\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateContactSettingRequest;
use App\Models\ContactSetting;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SuperadminContactSettingController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('viewAny', ContactSetting::class);

        $contacts = ContactSetting::orderBy('sort_order')->get();
        return view('superadmin.cms.contact.index', compact('contacts'));
    }

    public function update(UpdateContactSettingRequest $request)
    {
        $this->authorize('update', ContactSetting::class);

        $contacts = $request->validated('contacts');

        foreach ($contacts as $contactData) {
            ContactSetting::updateOrCreate(
                ['key' => $contactData['key']],
                [
                    'label' => $contactData['label'] ?? null,
                    'value' => $contactData['value'] ?? null,
                    'url' => $contactData['url'] ?? null,
                    'icon' => $contactData['icon'] ?? null,
                    'is_active' => $contactData['is_active'] ?? true,
                    'sort_order' => $contactData['sort_order'] ?? null,
                ]
            );
        }

        return redirect()->route('superadmin.cms.contact.index')
            ->with('success', 'Pengaturan kontak berhasil diupdate.');
    }
}
