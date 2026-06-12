<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\FixtureSyncService;
use Illuminate\Console\Command;

class SyncFixtureStatsCommand extends Command
{
    protected $signature = 'fixtures:sync-stats {fixture : Fixture ID}';

    protected $description = 'Fetch and store form, H2H, and standings for a fixture';

    public function handle(FixtureSyncService $sync): int
    {
        $fixture = Fixture::query()->find($this->argument('fixture'));

        if ($fixture === null) {
            $this->error('Fixture not found.');

            return self::FAILURE;
        }

        try {
            $sync->enrichMatchStats($fixture);
            $this->info("Stats synced for fixture #{$fixture->id}.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
