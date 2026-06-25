@extends('layouts.admin')

@php $pageTitle = 'Event Types' @endphp

@section('content')
<div>
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-lg font-semibold text-[#0B2D89]">Event Types Management</h2>
            <p class="text-sm text-[#64748B] mt-1">Manage event type classifications for the platform.</p>
        </div>
    </div>

    {{-- Add Event Type Form --}}
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 mb-6">
        <h3 class="text-sm font-semibold text-[#0F172A] mb-4">Add New Event Type</h3>
        <form action="{{ route('superadmin.master-data.event-types.store') }}" method="POST" class="flex flex-col sm:flex-row gap-3">
            @csrf
            <input type="text" name="name" placeholder="Event type name"
                class="flex-1 px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF] transition"
                required>
            <input type="text" name="description" placeholder="Description (optional)"
                class="flex-1 px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF] transition">
            <button type="submit"
                class="px-6 py-2.5 bg-[#126BFF] hover:bg-[#0B2D89] text-white text-sm font-semibold rounded-lg transition shadow-sm whitespace-nowrap">
                + Add Event Type
            </button>
        </form>
    </div>

    {{-- Event Types Table --}}
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-[#E2E8F0] bg-[#EEF7FF]">
                        <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Name</th>
                        <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Slug</th>
                        <th class="text-left px-6 py-3 font-semibold text-[#0B2D89]">Status</th>
                        <th class="text-right px-6 py-3 font-semibold text-[#0B2D89]">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#E2E8F0]">
                    @forelse($eventTypes as $eventType)
                        <tr class="hover:bg-[#EEF7FF]/50 transition" id="event-type-row-{{ $eventType->id }}">
                            <td class="px-6 py-3.5 text-[#0F172A] font-medium">
                                {{ $eventType->name }}
                            </td>
                            <td class="px-6 py-3.5 text-[#64748B] font-mono text-xs">
                                {{ $eventType->slug }}
                            </td>
                            <td class="px-6 py-3.5">
                                @if($eventType->is_active ?? true)
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#16A34A]/10 text-[#16A34A]">Active</span>
                                @else
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F59E0B]/10 text-[#F59E0B]">Inactive</span>
                                @endif
                            </td>
                            <td class="px-6 py-3.5 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button onclick="openEditModal({{ $eventType->id }}, '{{ addslashes($eventType->name) }}', '{{ addslashes($eventType->description ?? '') }}')"
                                        class="px-3 py-1.5 text-xs font-semibold text-[#126BFF] bg-[#126BFF]/10 rounded-lg hover:bg-[#126BFF]/20 transition">
                                        Edit
                                    </button>
                                    <form action="{{ route('superadmin.master-data.event-types.destroy', $eventType->id) }}" method="POST"
                                        onsubmit="return confirm('Delete this event type?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit"
                                            class="px-3 py-1.5 text-xs font-semibold text-[#DC2626] bg-[#DC2626]/10 rounded-lg hover:bg-[#DC2626]/20 transition">
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="px-6 py-12 text-center">
                                <svg class="w-12 h-12 text-[#E2E8F0] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <p class="text-[#64748B] text-sm">No event types found.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if(method_exists($eventTypes, 'links'))
            <div class="px-6 py-4 border-t border-[#E2E8F0]">
                {{ $eventTypes->links() }}
            </div>
        @endif
    </div>

    {{-- Edit Modal --}}
    <div id="editModal" class="hidden fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" onclick="closeEditModal()"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div class="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 class="text-base font-semibold text-[#0B2D89]">Edit Event Type</h3>
                <button onclick="closeEditModal()" class="text-[#64748B] hover:text-[#DC2626] transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <form id="editForm" method="POST" class="p-6 space-y-4">
                @csrf
                @method('PUT')
                <div>
                    <label class="block text-sm font-medium text-[#0F172A] mb-1.5">Name</label>
                    <input type="text" name="name" id="editName"
                        class="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF] transition"
                        required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-[#0F172A] mb-1.5">Description</label>
                    <textarea name="description" id="editDescription" rows="3"
                        class="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#126BFF]/30 focus:border-[#126BFF] transition resize-none"></textarea>
                </div>
                <div class="flex justify-end gap-3 pt-2">
                    <button type="button" onclick="closeEditModal()"
                        class="px-5 py-2.5 text-sm font-semibold text-[#64748B] bg-[#E2E8F0] hover:bg-[#CBD5E1] rounded-lg transition">
                        Cancel
                    </button>
                    <button type="submit"
                        class="px-5 py-2.5 bg-[#126BFF] hover:bg-[#0B2D89] text-white text-sm font-semibold rounded-lg transition shadow-sm">
                        Update
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function openEditModal(id, name, description) {
    document.getElementById('editForm').action = '{{ url("superadmin/master-data/event-types") }}/' + id;
    document.getElementById('editName').value = name;
    document.getElementById('editDescription').value = description;
    document.getElementById('editModal').classList.remove('hidden');
}
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}
</script>
@endsection
