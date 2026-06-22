@extends('layouts.app')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Approval Center</h1>
    <p class="text-gray-600">Kelola semua persetujuan dalam satu tempat</p>
</div>

<div class="flex flex-wrap gap-2 mb-6">
    <a href="{{ route('superadmin.approval-center.index', ['tab' => 'role-requests']) }}"
       class="px-4 py-2 rounded-lg text-sm font-medium transition {{ $tab === 'role-requests' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border' }}">
        Role Requests
        @if($counts['role-requests'] > 0)
            <span class="ml-1 px-1.5 py-0.5 bg-yellow-400 text-white text-xs rounded-full">{{ $counts['role-requests'] }}</span>
        @endif
    </a>
    <a href="{{ route('superadmin.approval-center.index', ['tab' => 'communities']) }}"
       class="px-4 py-2 rounded-lg text-sm font-medium transition {{ $tab === 'communities' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border' }}">
        Communities
        @if($counts['communities'] > 0)
            <span class="ml-1 px-1.5 py-0.5 bg-yellow-400 text-white text-xs rounded-full">{{ $counts['communities'] }}</span>
        @endif
    </a>
    <a href="{{ route('superadmin.approval-center.index', ['tab' => 'brands']) }}"
       class="px-4 py-2 rounded-lg text-sm font-medium transition {{ $tab === 'brands' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border' }}">
        Brands
        @if($counts['brands'] > 0)
            <span class="ml-1 px-1.5 py-0.5 bg-yellow-400 text-white text-xs rounded-full">{{ $counts['brands'] }}</span>
        @endif
    </a>
    <a href="{{ route('superadmin.approval-center.index', ['tab' => 'events']) }}"
       class="px-4 py-2 rounded-lg text-sm font-medium transition {{ $tab === 'events' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border' }}">
        Events
        @if($counts['events'] > 0)
            <span class="ml-1 px-1.5 py-0.5 bg-yellow-400 text-white text-xs rounded-full">{{ $counts['events'] }}</span>
        @endif
    </a>
    <a href="{{ route('superadmin.approval-center.index', ['tab' => 'collaborations']) }}"
       class="px-4 py-2 rounded-lg text-sm font-medium transition {{ $tab === 'collaborations' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border' }}">
        Collaborations
        @if($counts['collaborations'] > 0)
            <span class="ml-1 px-1.5 py-0.5 bg-yellow-400 text-white text-xs rounded-full">{{ $counts['collaborations'] }}</span>
        @endif
    </a>
    <a href="{{ route('superadmin.approval-center.index', ['tab' => 'payments']) }}"
       class="px-4 py-2 rounded-lg text-sm font-medium transition {{ $tab === 'payments' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border' }}">
        Payments
        @if($counts['payments'] > 0)
            <span class="ml-1 px-1.5 py-0.5 bg-yellow-400 text-white text-xs rounded-full">{{ $counts['payments'] }}</span>
        @endif
    </a>
</div>

<div class="bg-white rounded-xl shadow-sm">
    @if($data->isEmpty())
        <p class="text-gray-500 text-center py-12">Tidak ada data untuk ditampilkan.</p>
    @else
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        @if($tab === 'role-requests')
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Role</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        @elseif($tab === 'communities')
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        @elseif($tab === 'brands')
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        @elseif($tab === 'events')
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Community</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        @elseif($tab === 'collaborations')
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        @elseif($tab === 'payments')
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        @endif
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @if($tab === 'role-requests')
                        @foreach($data as $req)
                            <tr>
                                <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ $req->user->name }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $req->user->email }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ ucfirst(str_replace('_', ' ', $req->requested_role)) }}</td>
                                <td class="px-4 py-3">
                                    @if($req->status === 'pending')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                                    @elseif($req->status === 'approved')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                                    @else
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>
                                    @endif
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-500">{{ $req->created_at->format('d M Y H:i') }}</td>
                                <td class="px-4 py-3">
                                    @if($req->status === 'pending')
                                        <div class="flex space-x-2">
                                            <form method="POST" action="{{ route('superadmin.approval-center.role-requests.approve', $req) }}">
                                                @csrf
                                                <button type="submit" class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600" onclick="return confirm('Approve role request ini? User akan mendapat role {{ $req->requested_role }}.')">Approve</button>
                                            </form>
                                            <form method="POST" action="{{ route('superadmin.approval-center.role-requests.reject', $req) }}">
                                                @csrf
                                                <button type="submit" class="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600" onclick="return confirm('Reject role request ini?')">Reject</button>
                                            </form>
                                        </div>
                                    @else
                                        <span class="text-xs text-gray-500">{{ $req->reviewer?->name ?? '-' }}</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    @elseif($tab === 'communities')
                        @foreach($data as $community)
                            <tr>
                                <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ $community->name }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $community->owner->name ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $community->category->name ?? '-' }}</td>
                                <td class="px-4 py-3">
                                    @if($community->status === 'pending')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                                    @elseif($community->status === 'approved')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                                    @else
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>
                                    @endif
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex space-x-2">
                                        @if($community->status === 'pending')
                                            <form method="POST" action="{{ route('superadmin.approval-center.communities.approve', $community) }}">
                                                @csrf
                                                <button type="submit" class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600" onclick="return confirm('Approve komunitas {{ $community->name }}?')">Approve</button>
                                            </form>
                                            <form method="POST" action="{{ route('superadmin.approval-center.communities.reject', $community) }}">
                                                @csrf
                                                <button type="submit" class="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600" onclick="return confirm('Reject komunitas {{ $community->name }}?')">Reject</button>
                                            </form>
                                        @else
                                            <a href="{{ route('superadmin.communities.show', $community) }}" class="text-emerald-600 hover:text-emerald-800 text-xs">Detail</a>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    @elseif($tab === 'brands')
                        @foreach($data as $brand)
                            <tr>
                                <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ $brand->name }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $brand->owner->name ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $brand->industry ?? '-' }}</td>
                                <td class="px-4 py-3">
                                    @if($brand->status === 'pending')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                                    @elseif($brand->status === 'approved')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                                    @else
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>
                                    @endif
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex space-x-2">
                                        @if($brand->status === 'pending')
                                            <form method="POST" action="{{ route('superadmin.approval-center.brands.approve', $brand) }}">
                                                @csrf
                                                <button type="submit" class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600" onclick="return confirm('Approve brand {{ $brand->name }}?')">Approve</button>
                                            </form>
                                            <form method="POST" action="{{ route('superadmin.approval-center.brands.reject', $brand) }}">
                                                @csrf
                                                <button type="submit" class="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600" onclick="return confirm('Reject brand {{ $brand->name }}?')">Reject</button>
                                            </form>
                                        @else
                                            <a href="{{ route('superadmin.brands.show', $brand) }}" class="text-emerald-600 hover:text-emerald-800 text-xs">Detail</a>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    @elseif($tab === 'events')
                        @foreach($data as $event)
                            <tr>
                                <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ $event->title }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $event->community->name ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ ucfirst($event->event_type) }}</td>
                                <td class="px-4 py-3">
                                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex space-x-2">
                                        <form method="POST" action="{{ route('superadmin.approval-center.events.approve', $event) }}">
                                            @csrf
                                            <button type="submit" class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600" onclick="return confirm('Approve event {{ $event->title }}?')">Approve</button>
                                        </form>
                                        <form method="POST" action="{{ route('superadmin.approval-center.events.reject', $event) }}">
                                            @csrf
                                            <button type="submit" class="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600" onclick="return confirm('Reject event {{ $event->title }}?')">Reject</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    @elseif($tab === 'collaborations')
                        @foreach($data as $collab)
                            <tr>
                                <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ $collab->title }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $collab->senderCommunity->name ?? $collab->brand->name ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $collab->community->name ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ ucfirst(str_replace('_', ' ', $collab->collaboration_type)) }}</td>
                                <td class="px-4 py-3">
                                    @if($collab->status === 'pending')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                                    @elseif($collab->status === 'accepted' || $collab->status === 'completed')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{{ ucfirst($collab->status) }}</span>
                                    @else
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">{{ ucfirst($collab->status) }}</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    @elseif($tab === 'payments')
                        @foreach($data as $payment)
                            <tr>
                                <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ $payment->registration->user->name ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $payment->registration->event->title ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">Rp {{ number_format($payment->amount_paid, 0, ',', '.') }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $payment->bank_name ?? '-' }}</td>
                                <td class="px-4 py-3">
                                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex space-x-2">
                                        <form method="POST" action="{{ route('superadmin.approval-center.payments.confirm', $payment) }}">
                                            @csrf
                                            <button type="submit" class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600" onclick="return confirm('Konfirmasi pembayaran Rp {{ number_format($payment->amount_paid, 0, ',', '.') }}?')">Confirm</button>
                                        </form>
                                        <form method="POST" action="{{ route('superadmin.approval-center.payments.reject', $payment) }}">
                                            @csrf
                                            <button type="submit" class="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600" onclick="return confirm('Reject pembayaran ini?')">Reject</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    @endif
                </tbody>
            </table>
        </div>
        <div class="p-4">
            {{ $data->withQueryString()->links() }}
        </div>
    @endif
</div>
@endsection
