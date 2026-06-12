<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SportType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    protected $fillable = [
        'external_id',
        'name',
        'logo',
        'sport_type',
    ];

    protected function casts(): array
    {
        return [
            'external_id' => 'integer',
            'sport_type' => SportType::class,
        ];
    }

    public function homeFixtures(): HasMany
    {
        return $this->hasMany(Fixture::class, 'home_team_id');
    }

    public function awayFixtures(): HasMany
    {
        return $this->hasMany(Fixture::class, 'away_team_id');
    }
}
