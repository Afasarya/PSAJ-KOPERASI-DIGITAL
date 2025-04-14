<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('user_id')->constrained();
            $table->string('customer_name')->nullable();
            $table->decimal('total_amount', 15, 2);
            $table->foreignId('payment_method_id')->constrained();
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->float('anomaly_score')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};