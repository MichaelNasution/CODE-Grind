<?php

declare(strict_types=1);

namespace App\Data;

use App\Enums\SportType;
use Carbon\Carbon;

final class FixtureData
{
    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>|null
     */
    public static function fromFootballApi(array $item, int $leagueExternalId): ?array
    {
        $fixture = $item['fixture'] ?? null;
        $teams = $item['teams'] ?? null;
        $goals = $item['goals'] ?? null;

        if (! is_array($fixture) || ! is_array($teams)) {
            return null;
        }

        $home = $teams['home'] ?? [];
        $away = $teams['away'] ?? [];

        return [
            'external_id' => (int) ($fixture['id'] ?? 0),
            'league_external_id' => $leagueExternalId,
            'match_time' => isset($fixture['date']) ? Carbon::parse($fixture['date']) : null,
            'status' => (string) ($fixture['status']['short'] ?? 'NS'),
            'home_score' => isset($goals['home']) ? (int) $goals['home'] : null,
            'away_score' => isset($goals['away']) ? (int) $goals['away'] : null,
            'venue' => $fixture['venue']['name'] ?? null,
            'sport_type' => SportType::Football->value,
            'home_team' => self::teamPayload($home),
            'away_team' => self::teamPayload($away),
        ];
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>|null
     */
    public static function fromBasketballApi(array $item, int $leagueExternalId): ?array
    {
        $teams = $item['teams'] ?? null;
        if (! is_array($teams)) {
            return null;
        }

        $home = $teams['home'] ?? [];
        $away = $teams['away'] ?? [];
        $scores = $item['scores'] ?? [];

        $homeScore = $scores['home']['total'] ?? $scores['home'] ?? null;
        $awayScore = $scores['away']['total'] ?? $scores['away'] ?? null;

        return [
            'external_id' => (int) ($item['id'] ?? 0),
            'league_external_id' => $leagueExternalId,
            'match_time' => isset($item['date']) ? Carbon::parse($item['date']) : null,
            'status' => (string) ($item['status']['short'] ?? $item['status'] ?? 'NS'),
            'home_score' => is_numeric($homeScore) ? (int) $homeScore : null,
            'away_score' => is_numeric($awayScore) ? (int) $awayScore : null,
            'venue' => $item['venue'] ?? null,
            'sport_type' => SportType::Basketball->value,
            'home_team' => self::teamPayload($home),
            'away_team' => self::teamPayload($away),
        ];
    }

    /**
     * @param  array<string, mixed>  $team
     * @return array{external_id: int, name: string, logo: string|null}
     */
    private static function teamPayload(array $team): array
    {
        return [
            'external_id' => (int) ($team['id'] ?? 0),
            'name' => (string) ($team['name'] ?? 'Unknown'),
            'logo' => $team['logo'] ?? null,
        ];
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array{result: string, opponent: string, score: string, date: string}|null
     */
    public static function formEntryFromFootball(array $item, int $teamExternalId): ?array
    {
        $teams = $item['teams'] ?? [];
        $goals = $item['goals'] ?? [];
        $fixture = $item['fixture'] ?? [];

        $homeId = (int) ($teams['home']['id'] ?? 0);
        $isHome = $homeId === $teamExternalId;
        $teamGoals = (int) ($isHome ? ($goals['home'] ?? 0) : ($goals['away'] ?? 0));
        $oppGoals = (int) ($isHome ? ($goals['away'] ?? 0) : ($goals['home'] ?? 0));
        $opponent = $isHome ? ($teams['away']['name'] ?? '?') : ($teams['home']['name'] ?? '?');

        $result = match (true) {
            $teamGoals > $oppGoals => 'W',
            $teamGoals < $oppGoals => 'L',
            default => 'D',
        };

        return [
            'result' => $result,
            'opponent' => (string) $opponent,
            'score' => "{$teamGoals}-{$oppGoals}",
            'date' => isset($fixture['date']) ? Carbon::parse($fixture['date'])->toDateString() : '',
        ];
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array{home: string, away: string, score: string, date: string}|null
     */
    public static function h2hEntryFromFootball(array $item): ?array
    {
        $teams = $item['teams'] ?? [];
        $goals = $item['goals'] ?? [];
        $fixture = $item['fixture'] ?? [];

        return [
            'home' => (string) ($teams['home']['name'] ?? '?'),
            'away' => (string) ($teams['away']['name'] ?? '?'),
            'score' => ((int) ($goals['home'] ?? 0)).'-'.((int) ($goals['away'] ?? 0)),
            'date' => isset($fixture['date']) ? Carbon::parse($fixture['date'])->toDateString() : '',
        ];
    }
}
