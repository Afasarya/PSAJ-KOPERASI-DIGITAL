<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_forecasts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained();
            $table->date('forecast_date');
            $table->integer('predicted_sales');
            $table->float('confidence_score');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_forecasts');
    }
};