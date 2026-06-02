<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leagues', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('external_id');
            $table->string('name');
            $table->string('logo')->nullable();
            $table->string('country')->nullable();
            $table->string('sport_type', 20);
            $table->boolean('is_prestigious')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(100);
            $table->timestamps();

            $table->unique(['external_id', 'sport_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leagues');
    }
};
