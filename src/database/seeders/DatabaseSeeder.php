<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Gera 30 registros para a tabela 'tables'
        $statuses = ['available', 'reserved', 'busy'];

        $tables = [];
        for ($i = 1; $i <= 30; $i++) {
            $tables[] = [
                'number' => $i,
                'status' => $statuses[array_rand($statuses)], // Status aleatório
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('tables')->insert($tables);

        $this->command->info('30 registros criados na tabela "tables".');
    }
}
