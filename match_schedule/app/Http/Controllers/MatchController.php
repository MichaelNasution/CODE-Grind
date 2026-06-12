<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Fixture;
use App\Services\FixtureSyncService;
use App\Services\NewsAggregatorService;
use App\Services\UrgencyAnalyzer;
use Illuminate\View\View;

class MatchController extends Controller
{
    public function show(
        Fixture $fixture,
        FixtureSyncService $sync,
        NewsAggregatorService $news,
        UrgencyAnalyzer $urgency
    ): View {
        $fixture->load(['league', 'homeTeam', 'awayTeam', 'matchStat']);

        if ($fixture->matchStat === null || $fixture->matchStat->isStale()) {
            try {
                $sync->enrichMatchStats($fixture);
                $fixture->load('matchStat');
            } catch (\Throwable) {
                // allow page render without stats when API unavailable
            }
        }

        $urgencyData = $urgency->analyze($fixture);

        try {
            $headlines = $news->forFixture($fixture);
        } catch (\Throwable) {
            $headlines = [];
        }

        return view('matches.show', [
            'fixture' => $fixture,
            'urgency' => $urgencyData,
            'headlines' => $headlines,
        ]);
    }
}
