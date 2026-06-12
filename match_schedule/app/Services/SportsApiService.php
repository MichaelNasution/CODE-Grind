<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class SportsApiService
{
    private ?int $lastRateLimitRemaining = null;

    private ?int $lastRateLimitLimit = null;

    public function lastRateLimitRemaining(): ?int
    {
        return $this->lastRateLimitRemaining;
    }

    public function lastRateLimitLimit(): ?int
    {
        return $this->lastRateLimitLimit;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function fixturesByDate(string $sportType, string $date): array
    {
        $cacheKey = "sports:{$sportType}:fixtures:date:{$date}";

        return Cache::remember($cacheKey, $this->cacheTtl(), function () use ($sportType, $date) {
            $response = $this->request($sportType, '/fixtures', ['date' => $date]);

            return $response['response'] ?? [];
        });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function fixturesByLeague(string $sportType, int $leagueId, int $season, ?string $from = null, ?string $to = null): array
    {
        $params = [
            'league' => $leagueId,
            'season' => $season,
        ];

        if ($from !== null) {
            $params['from'] = $from;
        }

        if ($to !== null) {
            $params['to'] = $to;
        }

        $cacheKey = 'sports:'.$sportType.':fixtures:league:'.$leagueId.':'.md5(json_encode($params));

        return Cache::remember($cacheKey, $this->cacheTtl(), function () use ($sportType, $params) {
            $response = $this->request($sportType, '/fixtures', $params);

            return $response['response'] ?? [];
        });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function headToHead(string $sportType, int $homeTeamId, int $awayTeamId, int $last = 10): array
    {
        $cacheKey = "sports:{$sportType}:h2h:{$homeTeamId}:{$awayTeamId}:{$last}";

        return Cache::remember($cacheKey, $this->cacheTtl(), function () use ($sportType, $homeTeamId, $awayTeamId, $last) {
            $response = $this->request($sportType, '/fixtures/headtohead', [
                'h2h' => "{$homeTeamId}-{$awayTeamId}",
                'last' => $last,
            ]);

            return $response['response'] ?? [];
        });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function teamLastFixtures(string $sportType, int $teamId, int $last = 5): array
    {
        $cacheKey = "sports:{$sportType}:team:{$teamId}:last:{$last}";

        return Cache::remember($cacheKey, $this->cacheTtl(), function () use ($sportType, $teamId, $last) {
            $response = $this->request($sportType, '/fixtures', [
                'team' => $teamId,
                'last' => $last,
            ]);

            return $response['response'] ?? [];
        });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function standings(string $sportType, int $leagueId, int $season): array
    {
        $cacheKey = "sports:{$sportType}:standings:{$leagueId}:{$season}";

        return Cache::remember($cacheKey, $this->cacheTtl(), function () use ($sportType, $leagueId, $season) {
            $response = $this->request($sportType, '/standings', [
                'league' => $leagueId,
                'season' => $season,
            ]);

            return $response['response'] ?? [];
        });
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    public function requestFootball(string $path, array $query = []): array
    {
        return $this->request('football', $path, $query);
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    public function requestBasketball(string $path, array $query = []): array
    {
        return $this->request('basketball', $path, $query);
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    private function request(string $sportType, string $path, array $query = []): array
    {
        $apiKey = config('sports.api_key');

        if (empty($apiKey)) {
            throw new RuntimeException('API_SPORTS_KEY is not configured.');
        }

        $baseUrl = $sportType === 'basketball'
            ? config('sports.basketball_base')
            : config('sports.football_base');

        /** @var Response $httpResponse */
        $httpResponse = Http::withHeaders([
            'x-apisports-key' => $apiKey,
        ])
            ->timeout(30)
            ->get(rtrim((string) $baseUrl, '/').$path, $query);

        $this->captureRateLimitHeaders($httpResponse);

        if ($httpResponse->failed()) {
            Log::warning('Sports API request failed', [
                'sport' => $sportType,
                'path' => $path,
                'status' => $httpResponse->status(),
                'body' => $httpResponse->body(),
            ]);

            throw new RuntimeException("Sports API error: HTTP {$httpResponse->status()}");
        }

        /** @var array<string, mixed> $data */
        $data = $httpResponse->json() ?? [];

        if (($data['errors'] ?? []) !== [] && ($data['response'] ?? null) === null) {
            Log::warning('Sports API returned errors', [
                'sport' => $sportType,
                'path' => $path,
                'errors' => $data['errors'],
            ]);
        }

        return $data;
    }

    private function captureRateLimitHeaders(Response $response): void
    {
        $remainingKey = config('sports.rate_limit.remaining_header');
        $limitKey = config('sports.rate_limit.limit_header');

        $remaining = $response->header($remainingKey);
        $limit = $response->header($limitKey);

        if ($remaining !== null) {
            $this->lastRateLimitRemaining = (int) $remaining;
        }

        if ($limit !== null) {
            $this->lastRateLimitLimit = (int) $limit;
        }
    }

    private function cacheTtl(): int
    {
        return (int) config('sports.cache_ttl', 600);
    }
}
