<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentMethodsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('payment_methods')->insert([
            ['name' => 'Tunai', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'QRIS', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Transfer Bank', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Debit', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
