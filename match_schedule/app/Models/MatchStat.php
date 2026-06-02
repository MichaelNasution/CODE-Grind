<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchStat extends Model
{
    protected $fillable = [
        'fixture_id',
        'home_form',
        'away_form',
        'h2h_history',
        'standings_snapshot',
        'synced_at',
    ];

    protected function casts(): array
    {
        return [
            'home_form' => 'array',
            'away_form' => 'array',
            'h2h_history' => 'array',
            'standings_snapshot' => 'array',
            'synced_at' => 'datetime',
        ];
    }

    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }
}
