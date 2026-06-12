<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SportType;
use App\Services\UrgencyAnalyzer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Fixture extends Model
{
    protected $fillable = [
        'external_id',
        'league_id',
        'home_team_id',
        'away_team_id',
        'match_time',
        'status',
        'home_score',
        'away_score',
        'sport_type',
        'venue',
    ];

    protected function casts(): array
    {
        return [
            'external_id' => 'integer',
            'match_time' => 'datetime',
            'home_score' => 'integer',
            'away_score' => 'integer',
            'sport_type' => SportType::class,
        ];
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function homeTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    public function matchStat(): HasOne
    {
        return $this->hasOne(MatchStat::class);
    }

    public function isLive(): bool
    {
        return in_array($this->status, ['1H', '2H', 'HT', 'ET', 'BT', 'LIVE', 'Q1', 'Q2', 'Q3', 'Q4'], true);
    }

    public function isFinished(): bool
    {
        return in_array($this->status, ['FT', 'AET', 'PEN', 'AOT'], true);
    }

    /**
     * @return array{score: int, label: string, factors: array<int, string>}
     */
    public function getUrgencyAttribute(): array
    {
        return app(UrgencyAnalyzer::class)->analyze($this);
    }
}
