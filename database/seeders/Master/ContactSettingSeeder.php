<?php

namespace Database\Seeders\Master;

use App\Models\ContactSetting;
use Illuminate\Database\Seeder;

class ContactSettingSeeder extends Seeder
{
    public function run(): void
    {
        $contacts = [
            ['key' => 'instagram', 'label' => 'Instagram', 'value' => '@komunaid', 'url' => 'https://instagram.com/komunaid', 'icon' => 'instagram', 'sort_order' => 1],
            ['key' => 'whatsapp', 'label' => 'WhatsApp', 'value' => '+6281234567890', 'url' => 'https://wa.me/6281234567890', 'icon' => 'whatsapp', 'sort_order' => 2],
            ['key' => 'email', 'label' => 'Email', 'value' => 'info@komuna.id', 'url' => 'mailto:info@komuna.id', 'icon' => 'mail', 'sort_order' => 3],
        ];

        foreach ($contacts as $contact) {
            ContactSetting::updateOrCreate(
                ['key' => $contact['key']],
                $contact
            );
        }
    }
}
