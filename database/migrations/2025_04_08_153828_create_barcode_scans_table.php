<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barcode_scans', function (Blueprint $table) {
            $table->id();
            $table->string('barcode');
            $table->foreignId('product_id')->nullable()->constrained();
            $table->foreignId('user_id')->constrained();
            $table->enum('scan_purpose', ['checkout', 'stock_opname', 'product_info']);
            $table->enum('scan_result', ['success', 'not_found', 'error']);
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barcode_scans');
    }
};
