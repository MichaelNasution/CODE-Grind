@props(['fixture'])

<a href="{{ route('matches.show', $fixture) }}"
   class="flex items-center gap-3 px-4 py-3 transition hover:bg-white/5">
    <time class="w-12 shrink-0 text-center text-xs tabular-nums text-fotmob-muted">
        {{ $fixture->match_time->format('H:i') }}
    </time>
    <div class="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 flex-1 items-center gap-2">
            @if ($fixture->homeTeam->logo)
                <img src="{{ $fixture->homeTeam->logo }}" alt="" class="h-5 w-5 shrink-0 object-contain" loading="lazy">
            @endif
            <span class="truncate text-sm {{ $fixture->isFinished() && ($fixture->home_score ?? 0) > ($fixture->away_score ?? 0) ? 'font-semibold text-white' : '' }}">
                {{ $fixture->homeTeam->name }}
            </span>
        </div>
        <div class="mx-2 shrink-0 text-center text-sm font-medium tabular-nums">
            @if ($fixture->isFinished() || $fixture->isLive())
                <span class="{{ $fixture->isLive() ? 'text-fotmob-live' : '' }}">
                    {{ $fixture->home_score ?? 0 }} - {{ $fixture->away_score ?? 0 }}
                </span>
            @else
                <span class="text-fotmob-muted">vs</span>
            @endif
        </div>
        <div class="flex min-w-0 flex-1 items-center justify-end gap-2 sm:justify-start">
            @if ($fixture->awayTeam->logo)
                <img src="{{ $fixture->awayTeam->logo }}" alt="" class="h-5 w-5 shrink-0 object-contain" loading="lazy">
            @endif
            <span class="truncate text-sm sm:text-right {{ $fixture->isFinished() && ($fixture->away_score ?? 0) > ($fixture->home_score ?? 0) ? 'font-semibold text-white' : '' }}">
                {{ $fixture->awayTeam->name }}
            </span>
        </div>
    </div>
    @if ($fixture->isLive())
        <span class="shrink-0 rounded bg-fotmob-live/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-fotmob-live">Live</span>
    @endif
</a>
