<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Fixture;
use App\Models\League;
use App\Models\MatchStat;
use App\Models\Team;
use Illuminate\Database\Seeder;

class DemoFixtureSeeder extends Seeder
{
    public function run(): void
    {
        if (Fixture::query()->exists()) {
            return;
        }

        $league = League::query()
            ->where('external_id', 39)
            ->where('sport_type', 'football')
            ->first();

        if ($league === null) {
            return;
        }

        $home = Team::query()->updateOrCreate(
            ['external_id' => 9001, 'sport_type' => 'football'],
            ['name' => 'Arsenal', 'logo' => null]
        );
        $away = Team::query()->updateOrCreate(
            ['external_id' => 9002, 'sport_type' => 'football'],
            ['name' => 'Chelsea', 'logo' => null]
        );

        $fixture = Fixture::query()->updateOrCreate(
            ['external_id' => 99001, 'sport_type' => 'football'],
            [
                'league_id' => $league->id,
                'home_team_id' => $home->id,
                'away_team_id' => $away->id,
                'match_time' => now()->addHours(2),
                'status' => 'NS',
                'home_score' => null,
                'away_score' => null,
                'venue' => 'Emirates Stadium',
            ]
        );

        MatchStat::query()->updateOrCreate(
            ['fixture_id' => $fixture->id],
            [
                'home_form' => [
                    ['result' => 'W', 'opponent' => 'Liverpool', 'score' => '2-1', 'date' => now()->subDays(7)->toDateString()],
                    ['result' => 'D', 'opponent' => 'Spurs', 'score' => '1-1', 'date' => now()->subDays(14)->toDateString()],
                    ['result' => 'W', 'opponent' => 'Brighton', 'score' => '3-0', 'date' => now()->subDays(21)->toDateString()],
                    ['result' => 'L', 'opponent' => 'Man City', 'score' => '0-2', 'date' => now()->subDays(28)->toDateString()],
                ],
                'away_form' => [
                    ['result' => 'L', 'opponent' => 'Newcastle', 'score' => '0-1', 'date' => now()->subDays(6)->toDateString()],
                    ['result' => 'W', 'opponent' => 'Fulham', 'score' => '2-0', 'date' => now()->subDays(13)->toDateString()],
                    ['result' => 'L', 'opponent' => 'Arsenal', 'score' => '1-3', 'date' => now()->subDays(20)->toDateString()],
                    ['result' => 'D', 'opponent' => 'West Ham', 'score' => '1-1', 'date' => now()->subDays(27)->toDateString()],
                ],
                'h2h_history' => [
                    ['home' => 'Arsenal', 'away' => 'Chelsea', 'score' => '2-1', 'date' => now()->subMonths(3)->toDateString()],
                    ['home' => 'Chelsea', 'away' => 'Arsenal', 'score' => '1-1', 'date' => now()->subMonths(6)->toDateString()],
                ],
                'synced_at' => now(),
            ]
        );
    }
}
