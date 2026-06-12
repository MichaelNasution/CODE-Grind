@extends('layouts.app')

@section('title', 'Fixtures — ' . config('app.name'))

@section('content')
    <div class="mb-6">
        <h1 class="mb-4 text-xl font-bold text-white">Upcoming Fixtures</h1>
        <div class="flex flex-wrap gap-2">
            @foreach ($windows as $h)
                @php
                    $label = $h === 24 ? '1 Day' : "{$h}h";
                    $active = $window === $h;
                @endphp
                <a href="{{ route('dashboard', ['sport' => $sport->value, 'window' => $h]) }}"
                   class="rounded-full px-4 py-1.5 text-sm font-medium transition {{ $active ? 'bg-fotmob-accent text-white' : 'bg-fotmob-card text-fotmob-muted hover:text-white' }}">
                    {{ $label }}
                </a>
            @endforeach
        </div>
    </div>

    @forelse ($grouped as $group)
        <details class="mb-3 overflow-hidden rounded-xl border border-fotmob-border bg-fotmob-card" open>
            <summary class="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-white/5">
                @if ($group['league']->logo)
                    <img src="{{ $group['league']->logo }}" alt="" class="h-6 w-6 object-contain" loading="lazy">
                @endif
                <div class="min-w-0 flex-1">
                    <span class="font-semibold text-white">{{ $group['league']->name }}</span>
                    @if ($group['league']->country)
                        <span class="ml-2 text-xs text-fotmob-muted">{{ $group['league']->country }}</span>
                    @endif
                </div>
                <span class="text-xs text-fotmob-muted">{{ $group['fixtures']->count() }} matches</span>
            </summary>
            <div class="divide-y divide-fotmob-border border-t border-fotmob-border">
                @foreach ($group['fixtures'] as $fixture)
                    <x-fixture-row :fixture="$fixture" />
                @endforeach
            </div>
        </details>
    @empty
        <div class="rounded-xl border border-fotmob-border bg-fotmob-card p-8 text-center">
            <p class="text-fotmob-muted">No fixtures in this time window.</p>
            <p class="mt-2 text-sm text-fotmob-muted">
                Run <code class="rounded bg-black/40 px-1">php artisan fixtures:sync</code> after setting <code class="rounded bg-black/40 px-1">API_SPORTS_KEY</code>.
            </p>
        </div>
    @endforelse
@endsection
