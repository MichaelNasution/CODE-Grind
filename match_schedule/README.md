# Live Sports Fixtures & Analytics

FotMob-inspired local dashboard for upcoming **football** and **basketball** fixtures, with form, head-to-head, news, and match urgency analysis.

## Stack

- Laravel 11, PHP 8.3+
- Tailwind CSS, Alpine.js
- API-SPORTS ([api-football](https://www.api-football.com/) + [api-basketball](https://api-sports.io/sports/basketball))
- SQLite (default) or MySQL

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite   # if using SQLite
php artisan migrate --seed
```

Add your API key to `.env`:

```env
API_SPORTS_KEY=your_key_here
```

Sync fixtures from prestigious leagues (uses API quota):

```bash
php artisan fixtures:sync
```

Run the app:

```bash
php artisan serve
npm install
npm run dev
```

Open [http://localhost:8000](http://localhost:8000).

## Artisan commands

| Command | Description |
|---------|-------------|
| `fixtures:sync` | Pull fixtures for seeded prestigious leagues (next 48h) |
| `fixtures:sync-stats {id}` | Fetch form, H2H, standings for one fixture |

Scheduled sync: every 10 minutes (`routes/console.php`) when `php artisan schedule:work` is running.

## API rate limits

The free API-SPORTS plan allows **100 requests/day**. This app minimizes usage by:

- Syncing only **prestigious** leagues
- Caching API responses for **10 minutes** (`SPORTS_CACHE_TTL`)
- Loading match stats **once per fixture** on detail view
- Seeding a **demo fixture** when the DB is empty (no API required for UI smoke test)

Monitor response headers: `x-ratelimit-requests-remaining`.

## Prestigious leagues (seeded)

| Sport | Leagues |
|-------|---------|
| Football | UCL, Premier League, La Liga, Serie A |
| Basketball | NBA, EuroLeague, IBL |

Verify basketball external IDs in your API-SPORTS dashboard if sync returns no games.

## Project structure

- `app/Services/SportsApiService.php` — HTTP client + cache
- `app/Services/FixtureSyncService.php` — DB upsert + stats enrichment
- `app/Services/NewsAggregatorService.php` — Google News RSS
- `app/Services/UrgencyAnalyzer.php` — local match importance scoring
