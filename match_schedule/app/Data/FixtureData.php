<?php

declare(strict_types=1);

namespace App\Data;

final readonly class FixtureData
{
    /**
     * @param  array<string, mixed>  $raw
     */
    public function __construct(
        public int $externalId,
        public int $leagueExternalId,
        public int $homeTeamExternalId,
        public int $awayTeamExternalId,
        public string $homeTeamName,
        public string $awayTeamName,
        public ?string $homeTeamLogo,
        public ?string $awayTeamLogo,
        public string $matchTime,
        public string $status,
        public ?int $homeScore,
        public ?int $awayScore,
        public string $sportType,
        public ?string $venue,
        public array $raw = [],
    ) {}

    /**
     * @param  array<string, mixed>  $item
     */
    public static function fromFootballApi(array $item): self
    {
        $fixture = $item['fixture'] ?? [];
        $league = $item['league'] ?? [];
        $teams = $item['teams'] ?? [];
        $goals = $item['goals'] ?? [];

        return new self(
            externalId: (int) ($fixture['id'] ?? 0),
            leagueExternalId: (int) ($league['id'] ?? 0),
            homeTeamExternalId: (int) ($teams['home']['id'] ?? 0),
            awayTeamExternalId: (int) ($teams['away']['id'] ?? 0),
            homeTeamName: (string) ($teams['home']['name'] ?? 'Home'),
            awayTeamName: (string) ($teams['away']['name'] ?? 'Away'),
            homeTeamLogo: $teams['home']['logo'] ?? null,
            awayTeamLogo: $teams['away']['logo'] ?? null,
            matchTime: (string) ($fixture['date'] ?? now()->toIso8601String()),
            status: (string) ($fixture['status']['short'] ?? 'NS'),
            homeScore: isset($goals['home']) ? (int) $goals['home'] : null,
            awayScore: isset($goals['away']) ? (int) $goals['away'] : null,
            sportType: 'football',
            venue: $fixture['venue']['name'] ?? null,
            raw: $item,
        );
    }

    /**
     * @param  array<string, mixed>  $item
     */
    public static function fromBasketballApi(array $item): self
    {
        $scores = $item['scores'] ?? [];
        $home = $scores['home'] ?? [];
        $away = $scores['away'] ?? [];

        return new self(
            externalId: (int) ($item['id'] ?? 0),
            leagueExternalId: (int) ($item['league']['id'] ?? 0),
            homeTeamExternalId: (int) ($item['teams']['home']['id'] ?? 0),
            awayTeamExternalId: (int) ($item['teams']['away']['id'] ?? 0),
            homeTeamName: (string) ($item['teams']['home']['name'] ?? 'Home'),
            awayTeamName: (string) ($item['teams']['away']['name'] ?? 'Away'),
            homeTeamLogo: $item['teams']['home']['logo'] ?? null,
            awayTeamLogo: $item['teams']['away']['logo'] ?? null,
            matchTime: (string) ($item['date'] ?? now()->toIso8601String()),
            status: (string) ($item['status']['short'] ?? 'NS'),
            homeScore: isset($home['total']) ? (int) $home['total'] : null,
            awayScore: isset($away['total']) ? (int) $away['total'] : null,
            sportType: 'basketball',
            venue: $item['venue'] ?? null,
            raw: $item,
        );
    }
}
