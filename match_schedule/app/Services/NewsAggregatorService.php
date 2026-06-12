<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Fixture;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use SimpleXMLElement;

class NewsAggregatorService
{
    /**
     * @return array<int, array{title: string, link: string, published: string, source: string}>
     */
    public function forFixture(Fixture $fixture): array
    {
        $fixture->load(['homeTeam', 'awayTeam']);

        $cacheKey = "news:fixture:{$fixture->id}";

        return Cache::remember($cacheKey, 900, function () use ($fixture) {
            $sportTerm = $fixture->sport_type->value === 'football' ? 'football' : 'basketball';

            $home = $this->fetchTeamNews($fixture->homeTeam->name, $sportTerm);
            $away = $this->fetchTeamNews($fixture->awayTeam->name, $sportTerm);

            $merged = array_merge($home, $away);
            usort($merged, fn ($a, $b) => strcmp($b['published'], $a['published']));

            $seen = [];
            $unique = [];
            foreach ($merged as $item) {
                $key = md5($item['title']);
                if (isset($seen[$key])) {
                    continue;
                }
                $seen[$key] = true;
                $unique[] = $item;
            }

            return array_slice($unique, 0, 15);
        });
    }

    /**
     * @return array<int, array{title: string, link: string, published: string, source: string}>
     */
    private function fetchTeamNews(string $teamName, string $sportTerm): array
    {
        $query = urlencode("{$teamName} {$sportTerm}");
        $url = "https://news.google.com/rss/search?q={$query}&hl=en&gl=US&ceid=US:en";

        try {
            $response = Http::timeout(15)->get($url);
            if (! $response->successful()) {
                return [];
            }

            $xml = @simplexml_load_string($response->body());
            if (! $xml instanceof SimpleXMLElement) {
                return [];
            }

            $items = [];
            foreach ($xml->channel->item ?? [] as $item) {
                $items[] = [
                    'title' => (string) ($item->title ?? ''),
                    'link' => (string) ($item->link ?? ''),
                    'published' => (string) ($item->pubDate ?? ''),
                    'source' => (string) ($item->source ?? 'Google News'),
                ];
                if (count($items) >= 8) {
                    break;
                }
            }

            return $items;
        } catch (\Throwable) {
            return [];
        }
    }
}
