@extends('layouts.dashboard')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-komuna-text">Staff Brand</h1>
        <p class="text-komuna-muted">{{ $brand->name }} - Kelola staf brand.</p>
    </div>
    <a href="{{ route('brand.brands.show', $brand) }}" class="text-komuna-muted text-sm hover:text-komuna-text">Kembali ke Brand</a>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-6 mb-6">
    <h2 class="text-lg font-semibold text-komuna-text mb-4">Tambah Staff</h2>
    <form action="{{ route('brand.staff.store', $brand) }}" method="POST" class="flex items-end gap-4">
        @csrf
        <div class="flex-1">
            <label class="block text-sm font-medium text-komuna-text mb-1">Cari User (nama atau email)</label>
            <input type="text" name="user_id" id="userSearch" placeholder="Ketik nama atau email..."
                class="w-full border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                autocomplete="off" required>
            <input type="hidden" name="user_id" id="selectedUserId" value="">
            <div id="searchResults" class="absolute z-10 bg-white border border-komuna-border rounded-lg shadow-lg mt-1 w-full hidden"></div>
        </div>
        <div>
            <label class="block text-sm font-medium text-komuna-text mb-1">Role</label>
            <input type="text" name="role" value="staff"
                class="border border-komuna-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue w-32">
        </div>
        <button type="submit" class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            Tambah
        </button>
    </form>
</div>

@if($members->count() > 0)
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-komuna-surface">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Nama</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Role</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Joined</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-komuna-muted uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($members as $member)
                        <tr class="hover:bg-komuna-surface">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {{ substr($member->user->name, 0, 1) }}
                                    </div>
                                    <span class="font-medium text-komuna-text text-sm">{{ $member->user->name }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $member->user->email }}</td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $member->role }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($member->status === 'active') bg-komuna-success-soft text-komuna-success
                                    @elseif($member->status === 'pending') bg-komuna-warning-soft text-komuna-warning
                                    @else bg-komuna-border-soft text-komuna-text
                                    @endif">
                                    {{ ucfirst($member->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-komuna-muted">{{ $member->joined_at?->format('d M Y') ?? '-' }}</td>
                            <td class="px-6 py-4">
                                <form action="{{ route('brand.staff.remove', [$brand, $member]) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus staff ini?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-komuna-danger hover:text-komuna-danger text-sm font-medium">Hapus</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-komuna-border-soft">
            {{ $members->links() }}
        </div>
    </div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-komuna-border-soft p-8 text-center">
        <div class="text-4xl mb-3">👥</div>
        <h3 class="font-semibold text-komuna-text mb-1">Belum Ada Staff</h3>
        <p class="text-komuna-muted text-sm">Tambahkan staff menggunakan form di atas.</p>
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
                        <div class="px-4 py-2 hover:bg-komuna-border-soft cursor-pointer text-sm" data-id="${u.id}" data-name="${u.name}">
                            <span class="font-medium">${u.name}</span>
                            <span class="text-komuna-muted ml-2">${u.email}</span>
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
