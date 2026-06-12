<!DOCTYPE html>
<html lang="en" x-data="{ dark: localStorage.getItem('theme') !== 'light' }" x-init="$watch('dark', v => { document.documentElement.classList.toggle('dark', v); localStorage.setItem('theme', v ? 'dark' : 'light') }); document.documentElement.classList.toggle('dark', dark)">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', config('app.name'))</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-fotmob-bg text-gray-100">
    <header class="sticky top-0 z-50 border-b border-fotmob-border bg-fotmob-bg/95 backdrop-blur">
        <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <a href="{{ route('dashboard') }}" class="text-lg font-bold tracking-tight text-white">
                {{ config('app.name', 'Live Sports') }}
            </a>
            <button type="button" @click="dark = !dark" class="rounded-lg border border-fotmob-border px-3 py-1.5 text-xs text-fotmob-muted hover:text-white">
                <span x-text="dark ? 'Light' : 'Dark'"></span>
            </button>
        </div>
    </header>

    <div class="mx-auto flex max-w-5xl gap-6 px-4 py-6">
        <aside class="hidden w-40 shrink-0 md:block">
            <nav class="space-y-1">
                @php
                    $sportParam = request('sport', 'football');
                    $windowParam = request('window', 3);
                @endphp
                <a href="{{ route('dashboard', ['sport' => 'football', 'window' => $windowParam]) }}"
                   class="block rounded-lg px-3 py-2 text-sm {{ $sportParam === 'football' ? 'bg-fotmob-accent/20 font-semibold text-fotmob-accent' : 'text-fotmob-muted hover:bg-fotmob-card' }}">
                    Sepak Bola
                </a>
                <a href="{{ route('dashboard', ['sport' => 'basketball', 'window' => $windowParam]) }}"
                   class="block rounded-lg px-3 py-2 text-sm {{ $sportParam === 'basketball' ? 'bg-fotmob-accent/20 font-semibold text-fotmob-accent' : 'text-fotmob-muted hover:bg-fotmob-card' }}">
                    Bola Basket
                </a>
            </nav>
        </aside>

        <main class="min-w-0 flex-1 pb-20 md:pb-6">
            @yield('content')
        </main>
    </div>

    <nav class="fixed bottom-0 left-0 right-0 border-t border-fotmob-border bg-fotmob-card md:hidden">
        <div class="flex">
            <a href="{{ route('dashboard', ['sport' => 'football', 'window' => $windowParam]) }}"
               class="flex-1 py-3 text-center text-xs {{ $sportParam === 'football' ? 'text-fotmob-accent font-semibold' : 'text-fotmob-muted' }}">
                Sepak Bola
            </a>
            <a href="{{ route('dashboard', ['sport' => 'basketball', 'window' => $windowParam]) }}"
               class="flex-1 py-3 text-center text-xs {{ $sportParam === 'basketball' ? 'text-fotmob-accent font-semibold' : 'text-fotmob-muted' }}">
                Bola Basket
            </a>
        </div>
    </nav>
</body>
</html>
