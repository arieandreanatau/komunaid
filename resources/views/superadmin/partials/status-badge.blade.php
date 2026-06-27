@php
    $status = $status ?? 'active';
    $styles = match($status) {
        'active', 'approved', 'confirmed', 'paid', 'completed' => 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]',
        'pending', 'waiting' => 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]',
        'suspended', 'inactive', 'archived', 'draft' => 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]',
        'banned', 'cancelled', 'rejected', 'failed' => 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]',
        'new' => 'bg-[#126BFF]/10 text-[#126BFF] border-[#126BFF]',
        default => 'bg-komuna-border-soft text-komuna-muted border-komuna-border',
    };
@endphp
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {{ $styles }}">
    {{ ucfirst((string) $status) }}
</span>
