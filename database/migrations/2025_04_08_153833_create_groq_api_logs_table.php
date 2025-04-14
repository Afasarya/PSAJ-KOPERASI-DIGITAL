<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('groq_api_logs', function (Blueprint $table) {
            $table->id();
            $table->string('endpoint');
            $table->string('operation_type');
            $table->text('prompt');
            $table->text('response')->nullable();
            $table->integer('tokens_used')->nullable();
            $table->float('processing_time')->nullable();
            $table->boolean('success')->default(true);
            $table->text('error_message')->nullable();
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('groq_api_logs');
    }
};