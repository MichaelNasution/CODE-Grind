<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\SportType;
use App\Exceptions\ApiSportsException;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SportsApiService
{
    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    public function requestFootball(string $endpoint, array $query = []): array
    {
        return $this->request(
            rtrim((string) config('sports.football_base'), '/'),
            $endpoint,
            $query
        );
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    public function requestBasketball(string $endpoint, array $query = []): array
    {
        return $this->request(
            rtrim((string) config('sports.basketball_base'), '/'),
            $endpoint,
            $query
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function fixturesByDate(Carbon $date, SportType $sport): array
    {
        $dateStr = $date->toDateString();
        $cacheKey = "sports:fixtures:{$sport->value}:{$dateStr}";

        return $this->remember($cacheKey, function () use ($dateStr, $sport) {
            if ($sport === SportType::Football) {
                $payload = $this->requestFootball('/fixtures', ['date' => $dateStr]);

                return $payload['response'] ?? [];
            }

            $payload = $this->requestBasketball('/games', ['date' => $dateStr]);

            return $payload['response'] ?? [];
        });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function fixturesByLeagueWindow(
        SportType $sport,
        int $leagueId,
        int $season,
        Carbon $from,
        Carbon $to
    ): array {
        $cacheKey = sprintf(
            'sports:fixtures:%s:%d:%d:%s:%s',
            $sport->value,
            $leagueId,
            $season,
            $from->toDateString(),
            $to->toDateString()
        );

        return $this->remember($cacheKey, function () use ($sport, $leagueId, $season, $from, $to) {
            $query = [
                'league' => $leagueId,
                'season' => $season,
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ];

            if ($sport === SportType::Football) {
                $payload = $this->requestFootball('/fixtures', $query);

                return $payload['response'] ?? [];
            }

            $payload = $this->requestBasketball('/games', $query);

            return $payload['response'] ?? [];
        });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function teamLastFixtures(SportType $sport, int $teamId, int $last = 8): array
    {
        $cacheKey = "sports:team:{$sport->value}:{$teamId}:last:{$last}";

        return $this->remember($cacheKey, function () use ($sport, $teamId, $last) {
            $query = ['team' => $teamId, 'last' => $last];

            if ($sport === SportType::Football) {
                $payload = $this->requestFootball('/fixtures', $query);

                return $payload['response'] ?? [];
            }

            $payload = $this->requestBasketball('/games', $query);

            return $payload['response'] ?? [];
        });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function headToHead(SportType $sport, int $homeId, int $awayId, int $last = 8): array
    {
        $h2h = "{$homeId}-{$awayId}";
        $cacheKey = "sports:h2h:{$sport->value}:{$h2h}:{$last}";

        return $this->remember($cacheKey, function () use ($sport, $h2h, $last) {
            if ($sport === SportType::Football) {
                $payload = $this->requestFootball('/fixtures/headtohead', [
                    'h2h' => $h2h,
                    'last' => $last,
                ]);

                return $payload['response'] ?? [];
            }

            $payload = $this->requestBasketball('/games/h2h', [
                'h2h' => $h2h,
            ]);

            return $payload['response'] ?? [];
        });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function standings(SportType $sport, int $leagueId, int $season): array
    {
        $cacheKey = "sports:standings:{$sport->value}:{$leagueId}:{$season}";

        return $this->remember($cacheKey, function () use ($sport, $leagueId, $season) {
            $query = ['league' => $leagueId, 'season' => $season];

            if ($sport === SportType::Football) {
                $payload = $this->requestFootball('/standings', $query);

                return $payload['response'] ?? [];
            }

            $payload = $this->requestBasketball('/standings', $query);

            return $payload['response'] ?? [];
        });
    }

    /**
     * @template T
     *
     * @param  Closure(): T  $callback
     * @return T
     */
    public function remember(string $cacheKey, Closure $callback): mixed
    {
        return Cache::remember($cacheKey, (int) config('sports.cache_ttl', 600), $callback);
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    private function request(string $baseUrl, string $endpoint, array $query = []): array
    {
        $apiKey = config('sports.api_key');
        if (empty($apiKey)) {
            throw new ApiSportsException('API_SPORTS_KEY is not configured.');
        }

        $url = $baseUrl.'/'.ltrim($endpoint, '/');

        /** @var Response $response */
        $response = Http::timeout(30)
            ->withHeaders(['x-apisports-key' => $apiKey])
            ->get($url, $query);

        $this->guardRateLimit($response);

        if (! $response->successful()) {
            throw new ApiSportsException(
                "API-SPORTS request failed [{$response->status()}]: {$url}"
            );
        }

        $data = $response->json();
        if (! is_array($data)) {
            throw new ApiSportsException('Invalid JSON response from API-SPORTS.');
        }

        $errors = $data['errors'] ?? [];
        if (is_array($errors) && $errors !== []) {
            throw new ApiSportsException('API-SPORTS errors: '.json_encode($errors));
        }

        return $data;
    }

    private function guardRateLimit(Response $response): void
    {
        $remainingHeader = (string) config('sports.rate_limit.remaining_header');
        $remaining = $response->header($remainingHeader);

        if ($remaining === null || $remaining === '') {
            return;
        }

        $remainingInt = (int) $remaining;

        if ($remainingInt <= 5) {
            Log::warning('API-SPORTS daily quota low', ['remaining' => $remainingInt]);
        }

        if ($remainingInt <= 0) {
            throw new ApiSportsException('API-SPORTS daily request quota exhausted.');
        }
    }
}
