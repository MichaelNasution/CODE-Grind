<?php

declare(strict_types=1);

namespace App\Enums;

enum SportType: string
{
    case Football = 'football';
    case Basketball = 'basketball';

    public function label(): string
    {
        return match ($this) {
            self::Football => 'Sepak Bola',
            self::Basketball => 'Bola Basket',
        };
    }
}
