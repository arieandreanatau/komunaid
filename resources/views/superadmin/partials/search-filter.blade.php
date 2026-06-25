@props(['route' => '#', 'searchPlaceholder' => 'Cari...', 'filters' => []])

<div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 mb-6">
    <form method="GET" action="{{ $route }}" class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[200px]">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="{{ $searchPlaceholder }}"
                   class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-transparent outline-none">
        </div>
        @foreach($filters as $filter)
            <div class="min-w-[150px]">
                <label class="block text-xs font-medium text-[#64748B] mb-1">{{ $filter['label'] }}</label>
                <select name="{{ $filter['name'] }}" class="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#126BFF] focus:border-transparent outline-none">
                    <option value="">Semua</option>
                    @foreach($filter['options'] as $value => $label)
                        <option value="{{ $value }}" {{ request($filter['name']) == $value ? 'selected' : '' }}>{{ $label }}</option>
                    @endforeach
                </select>
            </div>
        @endforeach
        <button type="submit" class="px-4 py-2 bg-[#126BFF] text-white text-sm font-medium rounded-lg hover:bg-[#0B2D89] transition">
            Filter
        </button>
        @if(request()->hasAny(['search', ...array_column($filters, 'name')]))
            <a href="{{ $route }}" class="px-4 py-2 bg-komuna-border-soft text-[#64748B] text-sm font-medium rounded-lg hover:bg-komuna-border transition">
                Reset
            </a>
        @endif
    </form>
</div>
