@extends('layouts.app')

@section('title', $fixture->homeTeam->name . ' vs ' . $fixture->awayTeam->name)

@section('content')
    <a href="{{ route('dashboard', ['sport' => $fixture->sport_type->value, 'window' => 24]) }}" class="mb-4 inline-block text-sm text-fotmob-muted hover:text-white">&larr; Back</a>

    <div class="mb-6 rounded-xl border border-fotmob-border bg-fotmob-card p-6">
        <p class="mb-2 text-center text-xs uppercase tracking-wide text-fotmob-muted">{{ $fixture->league->name }}</p>
        <div class="flex items-center justify-between gap-4">
            <div class="flex flex-1 flex-col items-center text-center">
                @if ($fixture->homeTeam->logo)
                    <img src="{{ $fixture->homeTeam->logo }}" alt="" class="mb-2 h-14 w-14 object-contain">
                @endif
                <span class="font-semibold">{{ $fixture->homeTeam->name }}</span>
                @if ($fixture->matchStat?->home_form)
                    <p class="mt-1 text-xs text-fotmob-muted">
                        {{ collect($fixture->matchStat->home_form)->pluck('result')->take(5)->implode('-') }}
                    </p>
                @endif
            </div>
            <div class="shrink-0 text-center">
                @if ($fixture->isFinished() || $fixture->isLive())
                    <p class="text-3xl font-bold tabular-nums">
                        {{ $fixture->home_score ?? 0 }} : {{ $fixture->away_score ?? 0 }}
                    </p>
                    <span class="text-xs {{ $fixture->isLive() ? 'text-fotmob-live' : 'text-fotmob-muted' }}">{{ $fixture->status }}</span>
                @else
                    <p class="text-2xl font-bold tabular-nums">{{ $fixture->match_time->format('H:i') }}</p>
                    <span class="text-xs text-fotmob-muted">{{ $fixture->match_time->format('D, M j') }}</span>
                @endif
            </div>
            <div class="flex flex-1 flex-col items-center text-center">
                @if ($fixture->awayTeam->logo)
                    <img src="{{ $fixture->awayTeam->logo }}" alt="" class="mb-2 h-14 w-14 object-contain">
                @endif
                <span class="font-semibold">{{ $fixture->awayTeam->name }}</span>
                @if ($fixture->matchStat?->away_form)
                    <p class="mt-1 text-xs text-fotmob-muted">
                        {{ collect($fixture->matchStat->away_form)->pluck('result')->take(5)->implode('-') }}
                    </p>
                @endif
            </div>
        </div>
        <div class="mt-4 flex justify-center">
            <x-urgency-meter :urgency="$urgency" />
        </div>
    </div>

  <div class="mb-6 grid gap-6 md:grid-cols-2" x-data="{ tab: 'form' }">
        <div class="rounded-xl border border-fotmob-border bg-fotmob-card p-4">
            <h2 class="mb-4 font-semibold">Recent Form</h2>
            <div class="space-y-4">
                <div>
                    <p class="mb-2 text-sm text-fotmob-muted">{{ $fixture->homeTeam->name }}</p>
                    <x-form-dots :matches="$fixture->matchStat?->home_form ?? []" />
                </div>
                <div>
                    <p class="mb-2 text-sm text-fotmob-muted">{{ $fixture->awayTeam->name }}</p>
                    <x-form-dots :matches="$fixture->matchStat?->away_form ?? []" />
                </div>
            </div>
        </div>
        <div class="rounded-xl border border-fotmob-border bg-fotmob-card p-4">
            <h2 class="mb-4 font-semibold">Head to Head</h2>
            @forelse ($fixture->matchStat?->h2h_history ?? [] as $match)
                <div class="flex items-center justify-between border-b border-fotmob-border py-2 text-sm last:border-0">
                    <span>{{ $match['home'] }} vs {{ $match['away'] }}</span>
                    <span class="font-mono text-fotmob-muted">{{ $match['score'] }}</span>
                </div>
            @empty
                <p class="text-sm text-fotmob-muted">No H2H data yet.</p>
            @endforelse
        </div>
    </div>

    <div class="rounded-xl border border-fotmob-border bg-fotmob-card" x-data="{ tab: 'news' }">
        <div class="flex border-b border-fotmob-border">
            <button type="button" @click="tab = 'news'"
                    :class="tab === 'news' ? 'border-b-2 border-fotmob-accent text-white' : 'text-fotmob-muted'"
                    class="flex-1 px-4 py-3 text-sm font-medium">News</button>
            <button type="button" @click="tab = 'analysis'"
                    :class="tab === 'analysis' ? 'border-b-2 border-fotmob-accent text-white' : 'text-fotmob-muted'"
                    class="flex-1 px-4 py-3 text-sm font-medium">Analysis</button>
        </div>
        <div class="p-4">
            <div x-show="tab === 'news'" x-cloak>
                @forelse ($headlines as $item)
                    <a href="{{ $item['link'] }}" target="_blank" rel="noopener"
                       class="block border-b border-fotmob-border py-3 text-sm last:border-0 hover:text-fotmob-accent">
                        {{ $item['title'] }}
                    </a>
                @empty
                    <p class="text-sm text-fotmob-muted">No headlines available.</p>
                @endforelse
            </div>
            <div x-show="tab === 'analysis'" x-cloak>
                <x-urgency-meter :urgency="$urgency" :detailed="true" />
                @if (!empty($urgency['factors']))
                    <ul class="mt-4 space-y-2 text-sm text-fotmob-muted">
                        @foreach ($urgency['factors'] as $factor)
                            <li class="flex gap-2"><span class="text-fotmob-accent">•</span> {{ $factor }}</li>
                        @endforeach
                    </ul>
                @endif
            </div>
        </div>
    </div>
@endsection
