<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\SportType;
use App\Models\Fixture;
use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(Request $request): View
    {
        $window = $this->resolveWindow((int) $request->query('window', 3));
        $sport = $this->resolveSport((string) $request->query('sport', 'football'));

        $from = now();
        $to = now()->addHours($window);

        $fixtures = Fixture::query()
            ->with(['league', 'homeTeam', 'awayTeam'])
            ->where('sport_type', $sport)
            ->whereBetween('match_time', [$from, $to])
            ->whereHas('league', fn ($q) => $q->where('is_prestigious', true))
            ->orderBy('match_time')
            ->get();

        $grouped = $fixtures
            ->groupBy(fn (Fixture $f) => $f->league_id)
            ->map(function ($leagueFixtures) {
                $league = $leagueFixtures->first()->league;

                return [
                    'league' => $league,
                    'fixtures' => $leagueFixtures->sortBy('match_time')->values(),
                ];
            })
            ->sortBy(fn ($group) => $group['league']->sort_order)
            ->values();

        return view('dashboard.index', [
            'grouped' => $grouped,
            'window' => $window,
            'sport' => $sport,
            'windows' => [1, 3, 6, 12, 24],
        ]);
    }

    private function resolveWindow(int $window): int
    {
        return in_array($window, [1, 3, 6, 12, 24], true) ? $window : 3;
    }

    private function resolveSport(string $sport): SportType
    {
        return $sport === 'basketball' ? SportType::Basketball : SportType::Football;
    }
}
