<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order_Item extends Model
{
    use HasFactory;
    protected $fillable = ['order_id', 'product_id', 'amount', 'unit_price'];

    public function pedido()
    {
        return $this->belongsTo(Orders::class);
    }

    public function produto()
    {
        return $this->belongsTo(Product::class);
    }
}
