@extends('layouts.admin')

@section('content')
<div class="mb-8">
    <h1 class="text-2xl font-bold text-[#0F172A]">Approval Center</h1>
    <p class="text-[#64748B]">Kelola semua persetujuan dalam satu tempat</p>
</div>

<div class="flex flex-wrap gap-2 mb-6">
    <a href="{{ route('superadmin.approval-center.index', ['tab' => 'role-requests']) }}"
       class="px-4 py-2 rounded-lg text-sm font-medium transition {{ $tab === 'role-requests' ? 'bg-[#16A34A] text-white' : 'bg-white text-[#64748B] hover:bg-[#EEF7FF]/50 border border-[#E2E8F0]' }}">
        Role Requests
        @if($counts['role-requests'] > 0)
            <span class="ml-1 px-1.5 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs rounded-full">{{ $counts['role-requests'] }}</span>
        @endif
    </a>
    <a href="{{ route('superadmin.approval-center.index', ['tab' => 'communities']) }}"
       class="px-4 py-2 rounded-lg text-sm font-medium transition {{ $tab === 'communities' ? 'bg-[#16A34A] text-white' : 'bg-white text-[#64748B] hover:bg-[#EEF7FF]/50 border border-[#E2E8F0]' }}">
        Communities
        @if($counts['communities'] > 0)
            <span class="ml-1 px-1.5 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs rounded-full">{{ $counts['communities'] }}</span>
        @endif
    </a>
    <a href="{{ route('superadmin.approval-center.index', ['tab' => 'brands']) }}"
       class="px-4 py-2 rounded-lg text-sm font-medium transition {{ $tab === 'brands' ? 'bg-[#16A34A] text-white' : 'bg-white text-[#64748B] hover:bg-[#EEF7FF]/50 border border-[#E2E8F0]' }}">
        Brands
        @if($counts['brands'] > 0)
            <span class="ml-1 px-1.5 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs rounded-full">{{ $counts['brands'] }}</span>
        @endif
    </a>
    <a href="{{ route('superadmin.approval-center.index', ['tab' => 'events']) }}"
       class="px-4 py-2 rounded-lg text-sm font-medium transition {{ $tab === 'events' ? 'bg-[#16A34A] text-white' : 'bg-white text-[#64748B] hover:bg-[#EEF7FF]/50 border border-[#E2E8F0]' }}">
        Events
        @if($counts['events'] > 0)
            <span class="ml-1 px-1.5 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs rounded-full">{{ $counts['events'] }}</span>
        @endif
    </a>
    <a href="{{ route('superadmin.approval-center.index', ['tab' => 'collaborations']) }}"
       class="px-4 py-2 rounded-lg text-sm font-medium transition {{ $tab === 'collaborations' ? 'bg-[#16A34A] text-white' : 'bg-white text-[#64748B] hover:bg-[#EEF7FF]/50 border border-[#E2E8F0]' }}">
        Collaborations
        @if($counts['collaborations'] > 0)
            <span class="ml-1 px-1.5 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs rounded-full">{{ $counts['collaborations'] }}</span>
        @endif
    </a>
    <a href="{{ route('superadmin.approval-center.index', ['tab' => 'payments']) }}"
       class="px-4 py-2 rounded-lg text-sm font-medium transition {{ $tab === 'payments' ? 'bg-[#16A34A] text-white' : 'bg-white text-[#64748B] hover:bg-[#EEF7FF]/50 border border-[#E2E8F0]' }}">
        Payments
        @if($counts['payments'] > 0)
            <span class="ml-1 px-1.5 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs rounded-full">{{ $counts['payments'] }}</span>
        @endif
    </a>
</div>

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
    @if($data->isEmpty())
        <p class="text-[#64748B] text-center py-12">Tidak ada data untuk ditampilkan.</p>
    @else
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-[#E2E8F0]">
                <thead class="bg-[#EEF7FF]">
                    <tr>
                        @if($tab === 'role-requests')
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">User</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Email</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Requested Role</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Date</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Actions</th>
                        @elseif($tab === 'communities')
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Name</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Owner</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Category</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Actions</th>
                        @elseif($tab === 'brands')
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Name</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Owner</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Industry</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Actions</th>
                        @elseif($tab === 'events')
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Title</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Community</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Type</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Actions</th>
                        @elseif($tab === 'collaborations')
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Title</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">From</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">To</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Type</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Status</th>
                        @elseif($tab === 'payments')
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">User</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Event</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Amount</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Bank</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-[#0B2D89] uppercase">Actions</th>
                        @endif
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#E2E8F0]">
                    @if($tab === 'role-requests')
                        @foreach($data as $req)
                            <tr>
                                <td class="px-4 py-3 text-sm text-[#0F172A] font-medium">{{ $req->user->name }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ $req->user->email }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ ucfirst(str_replace('_', ' ', $req->requested_role)) }}</td>
                                <td class="px-4 py-3">
                                    @if($req->status === 'pending')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]">Pending</span>
                                    @elseif($req->status === 'approved')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#16A34A]/10 text-[#16A34A]">Approved</span>
                                    @else
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#DC2626]/10 text-[#DC2626]">Rejected</span>
                                    @endif
                                </td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ $req->created_at->format('d M Y H:i') }}</td>
                                <td class="px-4 py-3">
                                    @if($req->status === 'pending')
                                        <div class="flex space-x-2">
                                            <form method="POST" action="{{ route('superadmin.approval-center.role-requests.approve', $req) }}">
                                                @csrf
                                                <button type="submit" class="bg-[#16A34A] text-white px-3 py-1 rounded text-xs hover:bg-green-700" onclick="return confirm('Approve role request ini? User akan mendapat role {{ $req->requested_role }}.')">Approve</button>
                                            </form>
                                            <form method="POST" action="{{ route('superadmin.approval-center.role-requests.reject', $req) }}">
                                                @csrf
                                                <button type="submit" class="bg-[#DC2626]/10 text-[#DC2626] px-3 py-1 rounded text-xs hover:bg-[#DC2626]/20" onclick="return confirm('Reject role request ini?')">Reject</button>
                                            </form>
                                        </div>
                                    @else
                                        <span class="text-xs text-[#64748B]">{{ $req->reviewer?->name ?? '-' }}</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    @elseif($tab === 'communities')
                        @foreach($data as $community)
                            <tr>
                                <td class="px-4 py-3 text-sm text-[#0F172A] font-medium">{{ $community->name }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ $community->owner->name ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ $community->category->name ?? '-' }}</td>
                                <td class="px-4 py-3">
                                    @if($community->status === 'pending')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]">Pending</span>
                                    @elseif($community->status === 'approved')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#16A34A]/10 text-[#16A34A]">Approved</span>
                                    @else
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#DC2626]/10 text-[#DC2626]">Rejected</span>
                                    @endif
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex space-x-2">
                                        @if($community->status === 'pending')
                                            <form method="POST" action="{{ route('superadmin.approval-center.communities.approve', $community) }}">
                                                @csrf
                                                <button type="submit" class="bg-[#16A34A] text-white px-3 py-1 rounded text-xs hover:bg-green-700" onclick="return confirm('Approve komunitas {{ $community->name }}?')">Approve</button>
                                            </form>
                                            <form method="POST" action="{{ route('superadmin.approval-center.communities.reject', $community) }}">
                                                @csrf
                                                <button type="submit" class="bg-[#DC2626]/10 text-[#DC2626] px-3 py-1 rounded text-xs hover:bg-[#DC2626]/20" onclick="return confirm('Reject komunitas {{ $community->name }}?')">Reject</button>
                                            </form>
                                        @else
                                            <a href="{{ route('superadmin.communities.show', $community) }}" class="text-[#126BFF] hover:text-[#0B2D89] text-xs">Detail</a>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    @elseif($tab === 'brands')
                        @foreach($data as $brand)
                            <tr>
                                <td class="px-4 py-3 text-sm text-[#0F172A] font-medium">{{ $brand->name }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ $brand->owner->name ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ $brand->industry ?? '-' }}</td>
                                <td class="px-4 py-3">
                                    @if($brand->status === 'pending')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]">Pending</span>
                                    @elseif($brand->status === 'approved')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#16A34A]/10 text-[#16A34A]">Approved</span>
                                    @else
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#DC2626]/10 text-[#DC2626]">Rejected</span>
                                    @endif
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex space-x-2">
                                        @if($brand->status === 'pending')
                                            <form method="POST" action="{{ route('superadmin.approval-center.brands.approve', $brand) }}">
                                                @csrf
                                                <button type="submit" class="bg-[#16A34A] text-white px-3 py-1 rounded text-xs hover:bg-green-700" onclick="return confirm('Approve brand {{ $brand->name }}?')">Approve</button>
                                            </form>
                                            <form method="POST" action="{{ route('superadmin.approval-center.brands.reject', $brand) }}">
                                                @csrf
                                                <button type="submit" class="bg-[#DC2626]/10 text-[#DC2626] px-3 py-1 rounded text-xs hover:bg-[#DC2626]/20" onclick="return confirm('Reject brand {{ $brand->name }}?')">Reject</button>
                                            </form>
                                        @else
                                            <a href="{{ route('superadmin.brands.show', $brand) }}" class="text-[#126BFF] hover:text-[#0B2D89] text-xs">Detail</a>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    @elseif($tab === 'events')
                        @foreach($data as $event)
                            <tr>
                                <td class="px-4 py-3 text-sm text-[#0F172A] font-medium">{{ $event->title }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ $event->community->name ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ ucfirst($event->event_type) }}</td>
                                <td class="px-4 py-3">
                                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]">Pending</span>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex space-x-2">
                                        <form method="POST" action="{{ route('superadmin.approval-center.events.approve', $event) }}">
                                            @csrf
                                            <button type="submit" class="bg-[#16A34A] text-white px-3 py-1 rounded text-xs hover:bg-green-700" onclick="return confirm('Approve event {{ $event->title }}?')">Approve</button>
                                        </form>
                                        <form method="POST" action="{{ route('superadmin.approval-center.events.reject', $event) }}">
                                            @csrf
                                            <button type="submit" class="bg-[#DC2626]/10 text-[#DC2626] px-3 py-1 rounded text-xs hover:bg-[#DC2626]/20" onclick="return confirm('Reject event {{ $event->title }}?')">Reject</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    @elseif($tab === 'collaborations')
                        @foreach($data as $collab)
                            <tr>
                                <td class="px-4 py-3 text-sm text-[#0F172A] font-medium">{{ $collab->title }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ $collab->senderCommunity->name ?? $collab->brand->name ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ $collab->community->name ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ ucfirst(str_replace('_', ' ', $collab->collaboration_type)) }}</td>
                                <td class="px-4 py-3">
                                    @if($collab->status === 'pending')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]">Pending</span>
                                    @elseif($collab->status === 'accepted' || $collab->status === 'completed')
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#16A34A]/10 text-[#16A34A]">{{ ucfirst($collab->status) }}</span>
                                    @else
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#DC2626]/10 text-[#DC2626]">{{ ucfirst($collab->status) }}</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    @elseif($tab === 'payments')
                        @foreach($data as $payment)
                            <tr>
                                <td class="px-4 py-3 text-sm text-[#0F172A] font-medium">{{ $payment->registration->user->name ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ $payment->registration->event->title ?? '-' }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">Rp {{ number_format($payment->amount_paid, 0, ',', '.') }}</td>
                                <td class="px-4 py-3 text-sm text-[#64748B]">{{ $payment->bank_name ?? '-' }}</td>
                                <td class="px-4 py-3">
                                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]">Pending</span>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex space-x-2">
                                        <form method="POST" action="{{ route('superadmin.approval-center.payments.confirm', $payment) }}">
                                            @csrf
                                            <button type="submit" class="bg-[#16A34A] text-white px-3 py-1 rounded text-xs hover:bg-green-700" onclick="return confirm('Konfirmasi pembayaran Rp {{ number_format($payment->amount_paid, 0, ',', '.') }}?')">Confirm</button>
                                        </form>
                                        <form method="POST" action="{{ route('superadmin.approval-center.payments.reject', $payment) }}">
                                            @csrf
                                            <button type="submit" class="bg-[#DC2626]/10 text-[#DC2626] px-3 py-1 rounded text-xs hover:bg-[#DC2626]/20" onclick="return confirm('Reject pembayaran ini?')">Reject</button>
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
