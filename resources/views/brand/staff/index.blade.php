@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Staff Brand</h1>
        <p class="text-gray-600">{{ $brand->name }} - Kelola staf brand.</p>
    </div>
    <a href="{{ route('brand.brands.show', $brand) }}" class="text-gray-600 text-sm hover:text-gray-800">Kembali ke Brand</a>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Tambah Staff</h2>
    <form action="{{ route('brand.staff.store', $brand) }}" method="POST" class="flex items-end gap-4">
        @csrf
        <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Cari User (nama atau email)</label>
            <input type="text" name="user_id" id="userSearch" placeholder="Ketik nama atau email..."
                class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autocomplete="off" required>
            <input type="hidden" name="user_id" id="selectedUserId" value="">
            <div id="searchResults" class="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 w-full hidden"></div>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input type="text" name="role" value="staff"
                class="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-32">
        </div>
        <button type="submit" class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            Tambah
        </button>
    </form>
</div>

@if($members->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
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
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {{ substr($member->user->name, 0, 1) }}
                                    </div>
                                    <span class="font-medium text-gray-900 text-sm">{{ $member->user->name }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $member->user->email }}</td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $member->role }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($member->status === 'active') bg-green-100 text-green-800
                                    @elseif($member->status === 'pending') bg-yellow-100 text-yellow-800
                                    @else bg-gray-100 text-gray-800
                                    @endif">
                                    {{ ucfirst($member->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $member->joined_at?->format('d M Y') ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <form action="{{ route('brand.staff.remove', [$brand, $member]) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus staff ini?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-100">
            {{ $members->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-4xl mb-3">👥</div>
        <h3 class="font-semibold text-gray-900 mb-1">Belum Ada Staff</h3>
        <p class="text-gray-500 text-sm">Tambahkan staff menggunakan form di atas.</p>
    </div>
@endif

<script>
    const searchInput = document.getElementById('userSearch');
    const selectedUserId = document.getElementById('selectedUserId');
    const resultsDiv = document.getElementById('searchResults');
    let debounceTimer;

    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const query = this.value.trim();
        if (query.length < 2) {
            resultsDiv.classList.add('hidden');
            return;
        }

        debounceTimer = setTimeout(() => {
            fetch(`{{ route('brand.staff.search-users', $brand) }}?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(users => {
                    if (users.length === 0) {
                        resultsDiv.classList.add('hidden');
                        return;
                    }
                    resultsDiv.innerHTML = users.map(u => `
                        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" data-id="${u.id}" data-name="${u.name}">
                            <span class="font-medium">${u.name}</span>
                            <span class="text-gray-500 ml-2">${u.email}</span>
                        </div>
                    `).join('');
                    resultsDiv.classList.remove('hidden');

                    resultsDiv.querySelectorAll('div[data-id]').forEach(el => {
                        el.addEventListener('click', () => {
                            searchInput.value = el.dataset.name;
                            selectedUserId.value = el.dataset.id;
                            resultsDiv.classList.add('hidden');
                        });
                    });
                });
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
            resultsDiv.classList.add('hidden');
        }
    });
</script>
@endsection
