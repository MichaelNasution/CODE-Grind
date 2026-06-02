<?php

declare(strict_types=1);

return [

    'api_key' => env('API_SPORTS_KEY'),

    'football_base' => env('API_SPORTS_FOOTBALL_BASE', 'https://v3.football.api-sports.io'),

    'basketball_base' => env('API_SPORTS_BASKETBALL_BASE', 'https://v1.basketball.api-sports.io'),

    'cache_ttl' => (int) env('SPORTS_CACHE_TTL', 600),

    'sync_horizon_hours' => (int) env('SPORTS_SYNC_HORIZON_HOURS', 48),

    'rate_limit' => [
        'remaining_header' => 'x-ratelimit-requests-remaining',
        'limit_header' => 'x-ratelimit-requests-limit',
    ],

];
