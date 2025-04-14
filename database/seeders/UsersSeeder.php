<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        DB::table('users')->insert([
            'name' => 'Admin Koperasi',
            'email' => 'admin@koperasi.com',
            'password' => Hash::make('password'),
            'role_id' => 1, // admin role
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Kasir user
        DB::table('users')->insert([
            'name' => 'Kasir Koperasi',
            'email' => 'kasir@koperasi.com',
            'password' => Hash::make('password'),
            'role_id' => 2, // kasir role
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}