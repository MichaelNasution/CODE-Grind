@props(['matches' => []])

<div class="flex flex-wrap gap-2">
    @foreach (array_slice($matches, 0, 8) as $match)
        @php
            $result = $match['result'] ?? 'D';
            $color = match ($result) {
                'W' => 'bg-emerald-500',
                'L' => 'bg-red-500',
                default => 'bg-zinc-500',
            };
            $title = ($match['opponent'] ?? '?') . ' (' . ($match['score'] ?? '') . ')';
        @endphp
        <span title="{{ $title }}"
              class="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white {{ $color }}">
            {{ $result }}
        </span>
    @endforeach
    @if (count($matches) === 0)
        <span class="text-sm text-fotmob-muted">—</span>
    @endif
</div>
