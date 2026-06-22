@extends('layouts.app')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Kelola Anggota</h1>
        <p class="text-gray-600">{{ $community->name }}</p>
    </div>
    <a href="{{ route('community.communities.show', $community) }}" class="text-gray-600 text-sm hover:text-gray-800">Kembali ke Detail</a>
</div>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold">✓</div>
            <div>
                <p class="text-xs text-gray-500">Aktif</p>
                <p class="text-2xl font-bold text-gray-900">{{ $stats['total_active'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 font-bold">🕐</div>
            <div>
                <p class="text-xs text-gray-500">Pending</p>
                <p class="text-2xl font-bold text-gray-900">{{ $stats['total_pending'] }}</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-bold">🚫</div>
            <div>
                <p class="text-xs text-gray-500">Banned</p>
                <p class="text-2xl font-bold text-gray-900">{{ $stats['total_banned'] }}</p>
            </div>
        </div>
    </div>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-4">
    <form action="{{ route('community.members.index', $community) }}" method="GET" class="flex flex-col sm:flex-row gap-3">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari nama atau email..."
            class="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
        <select name="status" class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            <option value="">Semua Status</option>
            <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
            <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>Pending</option>
            <option value="banned" {{ request('status') === 'banned' ? 'selected' : '' }}>Banned</option>
            <option value="left" {{ request('status') === 'left' ? 'selected' : '' }}>Left</option>
        </select>
        <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Filter</button>
    </form>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    @if($members->count() > 0)
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anggota</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bergabung</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @foreach($members as $member)
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                        {{ substr($member->user->name, 0, 1) }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-gray-900 text-sm">{{ $member->user->name }}</p>
                                        <p class="text-xs text-gray-500">{{ $member->user->email }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($member->role === 'admin') bg-purple-100 text-purple-800
                                    @elseif($member->role === 'volunteer') bg-blue-100 text-blue-800
                                    @else bg-gray-100 text-gray-800
                                    @endif">
                                    {{ ucfirst($member->role) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium
                                    @if($member->status === 'active') bg-green-100 text-green-800
                                    @elseif($member->status === 'pending') bg-yellow-100 text-yellow-800
                                    @elseif($member->status === 'banned') bg-red-100 text-red-800
                                    @else bg-gray-100 text-gray-800
                                    @endif">
                                    {{ ucfirst($member->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500">
                                {{ $member->joined_at ? $member->joined_at->format('d M Y') : '-' }}
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2 flex-wrap">
                                    @if($member->status === 'pending')
                                        <form action="{{ route('community.members.approve', [$community, $member]) }}" method="POST" class="inline">
                                            @csrf
                                            <button type="submit" class="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700">Terima</button>
                                        </form>
                                    @endif

                                    @if($member->status === 'active')
                                        <form action="{{ route('community.members.update-role', [$community, $member]) }}" method="POST" class="inline">
                                            @csrf
                                            @method('PUT')
                                            <select name="role" onchange="this.form.submit()" class="border border-gray-300 rounded text-xs px-2 py-1 focus:ring-1 focus:ring-emerald-500">
                                                <option value="member" {{ $member->role === 'member' ? 'selected' : '' }}>Member</option>
                                                <option value="volunteer" {{ $member->role === 'volunteer' ? 'selected' : '' }}>Volunteer</option>
                                                <option value="admin" {{ $member->role === 'admin' ? 'selected' : '' }}>Admin/Pengurus</option>
                                            </select>
                                        </form>
                                    @endif

                                    @if($member->status === 'active')
                                        <form action="{{ route('community.members.remove', [$community, $member]) }}" method="POST" class="inline" onsubmit="return confirm('Yakin ingin mengeluarkan anggota ini?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-orange-700">Remove</button>
                                        </form>

                                        <button onclick="document.getElementById('ban-{{ $member->id }}').classList.toggle('hidden')" class="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700">Ban</button>
                                    @endif

                                    @if($member->status === 'banned')
                                        <form action="{{ route('community.members.unban', [$community, $member]) }}" method="POST" class="inline">
                                            @csrf
                                            <button type="submit" class="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-emerald-700">Unban</button>
                                        </form>
                                    @endif
                                </div>

                                @if($member->status === 'active')
                                    <div id="ban-{{ $member->id }}" class="hidden mt-2">
                                        <form action="{{ route('community.members.ban', [$community, $member]) }}" method="POST" class="flex gap-2 items-center">
                                            @csrf
                                            <input type="text" name="reason" placeholder="Alasan ban..." class="flex-1 border border-gray-300 rounded text-xs px-3 py-1.5 focus:ring-1 focus:ring-red-500">
                                            <button type="submit" class="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700" onclick="return confirm('Yakin ingin memban anggota ini?')">Submit</button>
                                        </form>
                                    </div>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-100">
            {{ $members->withQueryString()->links() }}
        </div>
    @else
        <div class="p-8 text-center">
            <p class="text-gray-500">Tidak ada anggota ditemukan.</p>
        </div>
    @endif
</div>
@endsection
