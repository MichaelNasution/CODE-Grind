<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Fixture;

class UrgencyAnalyzer
{
    /**
     * @return array{score: int, label: string, factors: array<int, string>}
     */
    public function analyze(Fixture $fixture): array
    {
        $fixture->loadMissing(['matchStat', 'league', 'homeTeam', 'awayTeam']);

        $score = 0;
        $factors = [];

        $leagueName = strtoupper($fixture->league->name ?? '');
        if (str_contains($leagueName, 'CHAMPIONS') || str_contains($leagueName, 'UCL') || str_contains($leagueName, 'EUROPA')) {
            $score += 20;
            $factors[] = 'Knockout or European competition';
        }

        $homeForm = $fixture->matchStat?->home_form ?? [];
        $awayForm = $fixture->matchStat?->away_form ?? [];

        if ($this->hasLosingStreak($homeForm)) {
            $score += 15;
            $factors[] = "{$fixture->homeTeam->name} on a poor run (3+ losses in last 5)";
        }
        if ($this->hasLosingStreak($awayForm)) {
            $score += 15;
            $factors[] = "{$fixture->awayTeam->name} on a poor run (3+ losses in last 5)";
        }

        $standings = $fixture->matchStat?->standings_snapshot;
        if (is_array($standings) && $standings !== []) {
            $table = $this->extractStandingsTable($standings);
            if ($table !== []) {
                $homePos = $this->findTeamPosition($table, (int) $fixture->homeTeam->external_id);
                $awayPos = $this->findTeamPosition($table, (int) $fixture->awayTeam->external_id);

                if ($homePos !== null && $awayPos !== null) {
                    $total = count($table);
                    $relegationZone = max($total - 2, $total - 3);

                    if ($homePos >= $relegationZone && $awayPos >= $relegationZone) {
                        $score += 30;
                        $factors[] = 'Both teams in relegation battle';
                    }

                    if ($homePos <= 2 && $awayPos <= 2) {
                        $score += 35;
                        $factors[] = 'Title decider — top of the table clash';
                    }

                    if ($homePos <= 4 && $awayPos <= 6 && abs($homePos - $awayPos) <= 3) {
                        $score += 25;
                        $factors[] = 'European qualification on the line';
                    }
                }
            }
        } else {
            if ($this->bothTeamsStruggling($homeForm, $awayForm)) {
                $score += 20;
                $factors[] = 'Both sides need points based on recent form';
            }
        }

        $score = min(100, $score);

        return [
            'score' => $score,
            'label' => $this->labelForScore($score),
            'factors' => $factors,
        ];
    }

    /**
     * @param  array<int, array{result?: string}>  $form
     */
    private function hasLosingStreak(array $form): bool
    {
        $last = array_slice($form, 0, 5);
        $losses = 0;
        foreach ($last as $match) {
            if (($match['result'] ?? '') === 'L') {
                $losses++;
            }
        }

        return $losses >= 3;
    }

    /**
     * @param  array<int, array{result?: string}>  $homeForm
     * @param  array<int, array{result?: string}>  $awayForm
     */
    private function bothTeamsStruggling(array $homeForm, array $awayForm): bool
    {
        return $this->winRate($homeForm) < 0.4 && $this->winRate($awayForm) < 0.4;
    }

    /**
     * @param  array<int, array{result?: string}>  $form
     */
    private function winRate(array $form): float
    {
        if ($form === []) {
            return 0.5;
        }

        $wins = 0;
        foreach (array_slice($form, 0, 5) as $m) {
            if (($m['result'] ?? '') === 'W') {
                $wins++;
            }
        }

        return $wins / min(5, count($form));
    }

    /**
     * @param  array<int, mixed>  $standings
     * @return array<int, array{rank: int, team_id: int, points: int}>
     */
    private function extractStandingsTable(array $standings): array
    {
        $first = $standings[0] ?? null;
        if (! is_array($first)) {
            return [];
        }

        $leagueTable = $first['league']['standings'][0] ?? $first['standings'][0] ?? $first;
        if (! is_array($leagueTable)) {
            return [];
        }

        $rows = [];
        foreach ($leagueTable as $row) {
            if (! is_array($row)) {
                continue;
            }
            $rows[] = [
                'rank' => (int) ($row['rank'] ?? 0),
                'team_id' => (int) ($row['team']['id'] ?? 0),
                'points' => (int) ($row['points'] ?? 0),
            ];
        }

        usort($rows, fn ($a, $b) => $a['rank'] <=> $b['rank']);

        return $rows;
    }

    /**
     * @param  array<int, array{rank: int, team_id: int, points: int}>  $table
     */
    private function findTeamPosition(array $table, int $teamExternalId): ?int
    {
        foreach ($table as $row) {
            if ($row['team_id'] === $teamExternalId) {
                return $row['rank'];
            }
        }

        return null;
    }

    private function labelForScore(int $score): string
    {
        if ($score >= 70) {
            return 'Crucial Match';
        }
        if ($score >= 40) {
            return 'High Stakes';
        }

        return 'Routine Fixture';
    }
}
