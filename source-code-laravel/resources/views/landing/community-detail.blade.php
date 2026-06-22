@extends('layouts.app')

@section('title', $community->name . ' - KomunaID')

@section('content')
<div class="bg-navy py-12">
    <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center gap-4">
            <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center text-navy font-bold text-3xl">
                {{ substr($community->name, 0, 1) }}
            </div>
            <div class="text-white">
                <h1 class="text-3xl font-bold">{{ $community->name }}</h1>
                <p class="text-sky-blue">{{ $community->location ?? 'Indonesia' }} &bull; {{ ucfirst($community->category ?? 'umum') }}</p>
            </div>
        </div>
    </div>
</div>

<div class="max-w-7xl mx-auto px-4 py-8">
    <div class="grid md:grid-cols-3 gap-8">
        <div class="md:col-span-2 space-y-6">
            <div class="bg-white rounded-xl p-6 border">
                <h2 class="text-xl font-bold text-navy mb-4">Tentang</h2>
                <p class="text-gray-600">{{ $community->description ?? 'Tidak ada deskripsi.' }}</p>
            </div>

            @if($community->events->count())
                <div class="bg-white rounded-xl p-6 border">
                    <h2 class="text-xl font-bold text-navy mb-4">Event Mendatang</h2>
                    <div class="space-y-4">
                        @foreach($community->events as $event)
                            <div class="border rounded-lg p-4">
                                <h3 class="font-bold text-navy">{{ $event->title }}</h3>
                                <p class="text-sm text-gray-500">
                                    📅 {{ $event->start_date->format('d M Y H:i') }} &bull;
                                    📍 {{ $event->location }}
                                </p>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif
        </div>

        <div class="space-y-6">
            <div class="bg-white rounded-xl p-6 border">
                <div class="text-center mb-4">
                    <div class="text-3xl font-bold text-blue">{{ $community->approved_members_count }}</div>
                    <div class="text-gray-400">Anggota</div>
                </div>
                <div class="text-center mb-4">
                    <div class="text-3xl font-bold text-blue">{{ $community->events_count }}</div>
                    <div class="text-gray-400">Event</div>
                </div>
                @auth
                    @if(auth()->user()->hasRole(['member', 'community_owner', 'brand_owner']))
                        <form action="{{ route('member.communities.join', $community->id) }}" method="POST">
                            @csrf
                            <button type="submit" class="w-full bg-blue hover:bg-navy text-white py-2 rounded-lg transition">
                                Join Komunitas
                            </button>
                        </form>
                    @endif
                @else
                    <a href="{{ route('login') }}" class="block text-center bg-blue hover:bg-navy text-white py-2 rounded-lg transition">
                        Login untuk Join
                    </a>
                @endauth
            </div>

            <div class="bg-white rounded-xl p-6 border">
                <h3 class="font-bold text-navy mb-2">Pemilik</h3>
                <p class="text-gray-600">{{ $community->owner->name }}</p>
            </div>
        </div>
    </div>
</div>
@endsection
