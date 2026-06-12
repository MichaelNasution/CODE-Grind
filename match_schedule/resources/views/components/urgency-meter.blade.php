@props(['urgency', 'detailed' => false])

@php
    $score = (int) ($urgency['score'] ?? 0);
    $label = $urgency['label'] ?? 'Routine Fixture';
    $barColor = match (true) {
        $score >= 70 => 'bg-red-500',
        $score >= 40 => 'bg-amber-500',
        default => 'bg-zinc-500',
    };
@endphp

<div class="{{ $detailed ? 'w-full' : 'inline-block text-center' }}">
    @if ($detailed)
        <p class="mb-2 text-sm font-semibold text-white">Urgency: {{ $label }}</p>
    @else
        <span class="mb-1 block text-xs font-medium text-fotmob-muted">{{ $label }}</span>
    @endif
    <div class="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div class="h-full rounded-full transition-all {{ $barColor }}" style="width: {{ $score }}%"></div>
    </div>
    @if (!$detailed)
        <span class="mt-1 block text-[10px] text-fotmob-muted">{{ $score }}/100</span>
    @endif
</div>
