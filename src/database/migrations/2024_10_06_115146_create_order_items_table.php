<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->enum('status', ['active', 'cancelled', 'refunded'])->default('active');
            $table->unsignedTinyInteger('iva_rate'); // 👈 IVA snapshot
            $table->decimal('iva_amount', 10, 2)->default(0);      // 👈 valor do IVA
            $table->decimal('subtotal', 10, 2);                    // sem IVA
            $table->decimal('total_with_iva', 10, 2);              // com IVA
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
