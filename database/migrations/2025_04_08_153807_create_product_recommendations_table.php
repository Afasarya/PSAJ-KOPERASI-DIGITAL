<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('base_product_id')->constrained('products');
            $table->foreignId('recommended_product_id')->constrained('products');
            $table->float('confidence_score');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_recommendations');
    }
};