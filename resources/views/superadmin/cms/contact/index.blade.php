@extends('layouts.admin')

@section('content')
<h2 class="text-xl font-bold text-komuna-text mb-6">Contact Settings</h2>
<form action="{{ route('superadmin.cms.contact.update') }}" method="POST" class="bg-white rounded-2xl border border-komuna-border-soft p-6 space-y-6">
    @csrf @method('PUT')
    @php
        $contactList = $contacts->isNotEmpty() ? $contacts->toArray() : [
            ['key' => 'instagram', 'label' => 'Instagram', 'value' => '', 'url' => '', 'icon' => 'instagram', 'is_active' => true, 'sort_order' => 1],
            ['key' => 'whatsapp', 'label' => 'WhatsApp', 'value' => '', 'url' => '', 'icon' => 'whatsapp', 'is_active' => true, 'sort_order' => 2],
            ['key' => 'email', 'label' => 'Email', 'value' => '', 'url' => '', 'icon' => 'mail', 'is_active' => true, 'sort_order' => 3],
        ];
    @endphp
    @foreach($contactList as $index => $contact)
        <div class="border border-komuna-border-soft rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between">
                <h3 class="font-medium text-komuna-text">{{ ucfirst($contact['key']) }}</h3>
                <label class="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="contacts[{{ $index }}][is_active]" value="1" {{ !empty($contact['is_active']) ? 'checked' : '' }} class="rounded border-komuna-border text-komuna-blue focus:ring-komuna-blue">
                    Active
                </label>
            </div>
            <input type="hidden" name="contacts[{{ $index }}][key]" value="{{ $contact['key'] }}">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs text-komuna-muted mb-1">Label</label>
                    <input type="text" name="contacts[{{ $index }}][label]" value="{{ $contact['label'] ?? '' }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                </div>
                <div>
                    <label class="block text-xs text-komuna-muted mb-1">Value</label>
                    <input type="text" name="contacts[{{ $index }}][value]" value="{{ $contact['value'] ?? '' }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs text-komuna-muted mb-1">URL</label>
                    <input type="text" name="contacts[{{ $index }}][url]" value="{{ $contact['url'] ?? '' }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                </div>
                <div>
                    <label class="block text-xs text-komuna-muted mb-1">Icon</label>
                    <input type="text" name="contacts[{{ $index }}][icon]" value="{{ $contact['icon'] ?? '' }}" class="w-full rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                </div>
            </div>
            <input type="hidden" name="contacts[{{ $index }}][sort_order]" value="{{ $contact['sort_order'] ?? ($index + 1) }}">
        </div>
    @endforeach
    <div class="flex gap-3 pt-2">
        <button type="submit" class="bg-komuna-blue text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-komuna-navy transition">Simpan</button>
    </div>
</form>
@endsection
