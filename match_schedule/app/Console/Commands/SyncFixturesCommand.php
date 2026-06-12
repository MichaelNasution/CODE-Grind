<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\FixtureSyncService;
use Illuminate\Console\Command;

class SyncFixturesCommand extends Command
{
    protected $signature = 'fixtures:sync';

    protected $description = 'Sync upcoming fixtures for prestigious leagues from API-SPORTS';

    public function handle(FixtureSyncService $sync): int
    {
        $this->info('Syncing prestigious league fixtures...');

        try {
            $count = $sync->syncPrestigiousLeagues();
            $this->info("Synced {$count} fixture(s).");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
