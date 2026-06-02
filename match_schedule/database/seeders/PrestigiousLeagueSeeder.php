<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\League;
use Illuminate\Database\Seeder;

class PrestigiousLeagueSeeder extends Seeder
{
    /**
     * @var array<int, array<string, mixed>>
     */
    private const FOOTBALL_LEAGUES = [
        ['external_id' => 39, 'name' => 'Premier League', 'country' => 'England', 'sort_order' => 10],
        ['external_id' => 140, 'name' => 'La Liga', 'country' => 'Spain', 'sort_order' => 20],
        ['external_id' => 135, 'name' => 'Serie A', 'country' => 'Italy', 'sort_order' => 30],
        ['external_id' => 2, 'name' => 'UEFA Champions League', 'country' => 'Europe', 'sort_order' => 5],
    ];

    /**
     * @var array<int, array<string, mixed>>
     */
    private const BASKETBALL_LEAGUES = [
        ['external_id' => 12, 'name' => 'NBA', 'country' => 'USA', 'sort_order' => 10],
        ['external_id' => 120, 'name' => 'EuroLeague', 'country' => 'Europe', 'sort_order' => 20],
        ['external_id' => 91, 'name' => 'IBL', 'country' => 'Indonesia', 'sort_order' => 30],
    ];

    public function run(): void
    {
        foreach (self::FOOTBALL_LEAGUES as $league) {
            League::updateOrCreate(
                [
                    'external_id' => $league['external_id'],
                    'sport_type' => 'football',
                ],
                [
                    'name' => $league['name'],
                    'country' => $league['country'],
                    'sport_type' => 'football',
                    'is_prestigious' => true,
                    'sort_order' => $league['sort_order'],
                ]
            );
        }

        foreach (self::BASKETBALL_LEAGUES as $league) {
            League::updateOrCreate(
                [
                    'external_id' => $league['external_id'],
                    'sport_type' => 'basketball',
                ],
                [
                    'name' => $league['name'],
                    'country' => $league['country'],
                    'sport_type' => 'basketball',
                    'is_prestigious' => true,
                    'sort_order' => $league['sort_order'],
                ]
            );
        }
    }
}
