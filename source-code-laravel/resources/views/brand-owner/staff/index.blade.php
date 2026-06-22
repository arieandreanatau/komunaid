@extends('layouts.app')
@section('title', 'Staff Brand')
@section('content')
<div class="max-w-5xl mx-auto px-4 py-8">
    <a href="{{ route('brand-owner.brands.show', $brand) }}" class="text-blue hover:underline text-sm mb-4 inline-block">&larr; Kembali ke Brand</a>
    <h1 class="text-3xl font-bold text-navy mb-6">Staff - {{ $brand->name }}</h1>

    <div class="bg-white rounded-xl border p-6 mb-6">
        <h2 class="text-lg font-bold text-navy mb-4">Tambah Staff</h2>
        <form action="{{ route('brand-owner.staff.store', $brand) }}" method="POST" class="flex items-end gap-4">
            @csrf
            <div class="flex-1 relative">
                <label class="block text-sm font-medium text-gray-700 mb-1">Cari User (nama atau email)</label>
                <input type="text" id="userSearch" placeholder="Ketik nama atau email..."
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue" autocomplete="off">
                <input type="hidden" name="user_id" id="selectedUserId">
                <div id="searchResults" class="absolute z-10 bg-white border rounded-lg shadow-lg mt-1 w-full hidden"></div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input type="text" name="role" value="staff" class="px-4 py-2 border rounded-lg w-32">
            </div>
            <button type="submit" class="bg-blue hover:bg-navy text-white px-5 py-2 rounded-lg transition">Tambah</button>
        </form>
    </div>

    @if($members->count() > 0)
        <div class="bg-white rounded-xl border overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($members as $member)
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 font-medium text-sm">{{ $member->user->name }}</td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $member->user->email }}</td>
                            <td class="px-6 py-4 text-sm">{{ $member->role }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                    @if($member->status === 'active') bg-green-100 text-green-800
                                    @else bg-yellow-100 text-yellow-800
                                    @endif">{{ ucfirst($member->status) }}</span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $member->joined_at?->format('d M Y') ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <form action="{{ route('brand-owner.staff.remove', [$brand, $member]) }}" method="POST" onsubmit="return confirm('Yakin?')">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="text-red-500 text-sm hover:underline">Hapus</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="mt-4">{{ $members->links() }}</div>
    @else
        <div class="bg-white rounded-xl border p-8 text-center">
            <p class="text-gray-400">Belum ada staff. Tambahkan menggunakan form di atas.</p>
        </div>
    @endif
</div>

<script>
    const searchInput = document.getElementById('userSearch');
    const selectedUserId = document.getElementById('selectedUserId');
    const resultsDiv = document.getElementById('searchResults');
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const query = this.value.trim();
        if (query.length < 2) { resultsDiv.classList.add('hidden'); return; }
        debounceTimer = setTimeout(() => {
            fetch(`{{ route('brand-owner.staff.search-users', $brand) }}?q=${encodeURIComponent(query)}`)
                .then(res => res.json()).then(users => {
                    if (users.length === 0) { resultsDiv.classList.add('hidden'); return; }
                    resultsDiv.innerHTML = users.map(u => `<div class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" data-id="${u.id}" data-name="${u.name}"><span class="font-medium">${u.name}</span> <span class="text-gray-400">${u.email}</span></div>`).join('');
                    resultsDiv.classList.remove('hidden');
                    resultsDiv.querySelectorAll('div[data-id]').forEach(el => {
                        el.addEventListener('click', () => { searchInput.value = el.dataset.name; selectedUserId.value = el.dataset.id; resultsDiv.classList.add('hidden'); });
                    });
                });
        }, 300);
    });
    document.addEventListener('click', (e) => { if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) resultsDiv.classList.add('hidden'); });
</script>
@endsection
