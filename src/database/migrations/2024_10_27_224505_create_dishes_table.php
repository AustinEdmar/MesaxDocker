<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dishes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cuisine_id')->constrained()->onDelete('cascade');
            //$table->foreignId('dishes_sub_category_id')->constrained()->onDelete('cascade');
            // Na migration `dishes`
            $table->foreignId('dishes_sub_category_id')->constrained('dishes_sub_categories')->onDelete('cascade');
           
            $table->string('name');
            $table->string('original_name')->nullable(); // Nome original na língua nativa
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 8, 2);
            $table->boolean('spicy')->default(false);
            $table->boolean('vegetarian')->default(false);
            $table->boolean('active')->default(true);
            $table->integer('serving_size')->nullable(); // Número de pessoas que serve
            $table->json('allergens')->nullable(); // Array de alérgenos
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dishes');
    }
};
