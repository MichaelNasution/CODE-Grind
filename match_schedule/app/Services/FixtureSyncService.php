<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\FixtureData;
use App\Enums\SportType;
use App\Models\Fixture;
use App\Models\League;
use App\Models\MatchStat;
use App\Models\Team;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class FixtureSyncService
{
    public function __construct(
        private readonly SportsApiService $api
    ) {}

    public function syncPrestigiousLeagues(): int
    {
        $leagues = League::query()
            ->where('is_prestigious', true)
            ->orderBy('sort_order')
            ->get();

        $synced = 0;
        $horizon = now()->addHours((int) config('sports.sync_horizon_hours', 48));
        $season = (int) now()->year;

        foreach ($leagues as $league) {
            try {
                $synced += $this->syncLeague($league, now(), $horizon, $season);
            } catch (\Throwable $e) {
                Log::error('Fixture sync failed for league', [
                    'league_id' => $league->id,
                    'name' => $league->name,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $synced;
    }

    public function syncLeague(League $league, Carbon $from, Carbon $to, int $season): int
    {
        $items = $this->api->fixturesByLeagueWindow(
            $league->sport_type,
            (int) $league->external_id,
            $season,
            $from,
            $to
        );

        $count = 0;
        foreach ($items as $item) {
            $normalized = $league->sport_type === SportType::Football
                ? FixtureData::fromFootballApi($item, (int) $league->external_id)
                : FixtureData::fromBasketballApi($item, (int) $league->external_id);

            if ($normalized === null || ($normalized['external_id'] ?? 0) === 0) {
                continue;
            }

            if ($normalized['match_time'] === null) {
                continue;
            }

            if ($normalized['match_time']->lt($from) || $normalized['match_time']->gt($to)) {
                continue;
            }

            $home = $this->upsertTeam($normalized['home_team'], $league->sport_type);
            $away = $this->upsertTeam($normalized['away_team'], $league->sport_type);

            Fixture::query()->updateOrCreate(
                [
                    'external_id' => $normalized['external_id'],
                    'sport_type' => $league->sport_type,
                ],
                [
                    'league_id' => $league->id,
                    'home_team_id' => $home->id,
                    'away_team_id' => $away->id,
                    'match_time' => $normalized['match_time'],
                    'status' => $normalized['status'],
                    'home_score' => $normalized['home_score'],
                    'away_score' => $normalized['away_score'],
                    'venue' => $normalized['venue'],
                ]
            );

            $count++;
        }

        return $count;
    }

    public function enrichMatchStats(Fixture $fixture): MatchStat
    {
        $fixture->load(['homeTeam', 'awayTeam', 'league']);

        $sport = $fixture->sport_type;
        $season = (int) $fixture->match_time->year;

        $homeForm = [];
        $awayForm = [];
        $h2h = [];

        try {
            $homeRaw = $this->api->teamLastFixtures($sport, (int) $fixture->homeTeam->external_id, 8);
            $awayRaw = $this->api->teamLastFixtures($sport, (int) $fixture->awayTeam->external_id, 8);

            if ($sport === SportType::Football) {
                foreach ($homeRaw as $row) {
                    $entry = FixtureData::formEntryFromFootball($row, (int) $fixture->homeTeam->external_id);
                    if ($entry) {
                        $homeForm[] = $entry;
                    }
                }
                foreach ($awayRaw as $row) {
                    $entry = FixtureData::formEntryFromFootball($row, (int) $fixture->awayTeam->external_id);
                    if ($entry) {
                        $awayForm[] = $entry;
                    }
                }

                $h2hRaw = $this->api->headToHead(
                    $sport,
                    (int) $fixture->homeTeam->external_id,
                    (int) $fixture->awayTeam->external_id,
                    8
                );
                foreach ($h2hRaw as $row) {
                    $entry = FixtureData::h2hEntryFromFootball($row);
                    if ($entry) {
                        $h2h[] = $entry;
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Match stats enrichment partial failure', [
                'fixture_id' => $fixture->id,
                'error' => $e->getMessage(),
            ]);
        }

        $standings = null;
        try {
            $standings = $this->api->standings(
                $sport,
                (int) $fixture->league->external_id,
                $season
            );
        } catch (\Throwable) {
            // standings optional
        }

        return MatchStat::query()->updateOrCreate(
            ['fixture_id' => $fixture->id],
            [
                'home_form' => array_slice($homeForm, 0, 8),
                'away_form' => array_slice($awayForm, 0, 8),
                'h2h_history' => array_slice($h2h, 0, 8),
                'standings_snapshot' => $standings,
                'synced_at' => now(),
            ]
        );
    }

    /**
     * @param  array{external_id: int, name: string, logo: string|null}  $payload
     */
    private function upsertTeam(array $payload, SportType $sport): Team
    {
        return Team::query()->updateOrCreate(
            [
                'external_id' => $payload['external_id'],
                'sport_type' => $sport,
            ],
            [
                'name' => $payload['name'],
                'logo' => $payload['logo'],
            ]
        );
    }
}
