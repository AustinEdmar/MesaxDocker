<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Orders extends Model
{
    use HasFactory;
    protected $fillable = [
    'table_id',
    'user_id',
    'shift_id',
    'status',
    'subtotal',
    'iva',
    'discount',
    'total',
    'opened_at',
    'closed_at'
];

    public function tables()
    {
        return $this->belongsTo(Tables::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shifts::class);
    }



    public function items()
{
    return $this->hasMany(OrderItem::class, 'order_id');
}
}
