<?php

namespace Database\Seeders;

use DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // Buscar categorias pelo nome
        $bebidasId = DB::table('categories')->where('name', 'Bebidas')->value('id');
        $comidasId = DB::table('categories')->where('name', 'Comidas')->value('id');
        $sobremesasId = DB::table('categories')->where('name', 'Sobremesas')->value('id');

        $products = [
            // 🥤 BEBIDAS
            [
                'name' => 'Coca-Cola',
                'description' => 'Refrigerante gelado 350ml',
                'price' => 500,
                'iva' => 14,
                'stock' => 50,
                'category_id' => $bebidasId,
                'image_path' => 'image/produc/coca.png',
            ],
            [
                'name' => 'Sumo Natural',
                'description' => 'Sumo de fruta natural',
                'price' => 800,
                'iva' => 7,
                'stock' => 30,
                'category_id' => $bebidasId,
                'image_path' => 'image/product/sumo.jpg',
            ],

            // 🍔 COMIDAS
            [
                'name' => 'Hambúrguer',
                'description' => 'Hambúrguer com queijo e batata',
                'price' => 2500,
                'iva' => 14,
                'stock' => 20,
                'category_id' => $comidasId,
                'image_path' => 'image/product/hamburguer.png',
            ],
            [
                'name' => 'Pizza',
                'description' => 'Pizza grande 8 fatias',
                'price' => 7000,
                'iva' => 14,
                'stock' => 15,
                'category_id' => $comidasId,
                'image_path' => 'image/product/pizza.png',
            ],

            // 🍨 SOBREMESAS
            [
                'name' => 'Gelado',
                'description' => 'Gelado de baunilha',
                'price' => 1200,
                'iva' => 5,
                'stock' => 25,
                'category_id' => $sobremesasId,
                'image_path' => 'image/product/gelado.jpeg',
            ],
        ];

        foreach ($products as $product) {
            DB::table('products')->updateOrInsert(
                ['name' => $product['name']],
                [
                    'description' => $product['description'],
                    'price' => $product['price'],
                    'iva' => $product['iva'],
                    'stock' => $product['stock'],
                    'category_id' => $product['category_id'],
                    'image_path' => $product['image_path'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
