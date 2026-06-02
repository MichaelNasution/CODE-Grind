<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class League extends Model
{
    protected $fillable = [
        'external_id',
        'name',
        'logo',
        'country',
        'sport_type',
        'is_prestigious',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'external_id' => 'integer',
            'is_prestigious' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function fixtures(): HasMany
    {
        return $this->hasMany(Fixture::class);
    }
}
