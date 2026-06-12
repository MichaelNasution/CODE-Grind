<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\SportType;
use App\Models\League;
use Illuminate\Database\Seeder;

class PrestigiousLeagueSeeder extends Seeder
{
    public function run(): void
    {
        $leagues = [
            [
                'external_id' => 39,
                'name' => 'Premier League',
                'country' => 'England',
                'sport_type' => SportType::Football,
                'is_prestigious' => true,
                'sort_order' => 10,
            ],
            [
                'external_id' => 140,
                'name' => 'La Liga',
                'country' => 'Spain',
                'sport_type' => SportType::Football,
                'is_prestigious' => true,
                'sort_order' => 20,
            ],
            [
                'external_id' => 135,
                'name' => 'Serie A',
                'country' => 'Italy',
                'sport_type' => SportType::Football,
                'is_prestigious' => true,
                'sort_order' => 30,
            ],
            [
                'external_id' => 2,
                'name' => 'UEFA Champions League',
                'country' => 'Europe',
                'sport_type' => SportType::Football,
                'is_prestigious' => true,
                'sort_order' => 5,
            ],
            [
                'external_id' => 12,
                'name' => 'NBA',
                'country' => 'USA',
                'sport_type' => SportType::Basketball,
                'is_prestigious' => true,
                'sort_order' => 10,
            ],
            [
                'external_id' => 120,
                'name' => 'EuroLeague',
                'country' => 'Europe',
                'sport_type' => SportType::Basketball,
                'is_prestigious' => true,
                'sort_order' => 20,
            ],
            [
                'external_id' => 91,
                'name' => 'IBL',
                'country' => 'Indonesia',
                'sport_type' => SportType::Basketball,
                'is_prestigious' => true,
                'sort_order' => 30,
            ],
        ];

        foreach ($leagues as $data) {
            League::query()->updateOrCreate(
                [
                    'external_id' => $data['external_id'],
                    'sport_type' => $data['sport_type'],
                ],
                $data
            );
        }
    }
}
