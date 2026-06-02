<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fixtures', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('external_id');
            $table->foreignId('league_id')->constrained()->cascadeOnDelete();
            $table->foreignId('home_team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignId('away_team_id')->constrained('teams')->cascadeOnDelete();
            $table->dateTime('match_time');
            $table->string('status', 32)->default('NS');
            $table->unsignedSmallInteger('home_score')->nullable();
            $table->unsignedSmallInteger('away_score')->nullable();
            $table->string('sport_type', 20);
            $table->string('venue')->nullable();
            $table->timestamps();

            $table->unique(['external_id', 'sport_type']);
            $table->index(['match_time', 'sport_type']);
            $table->index(['league_id', 'match_time']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fixtures');
    }
};
