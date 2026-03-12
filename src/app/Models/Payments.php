<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payments extends Model
{
    
    protected $fillable = [
           
            'order_id',
            'shift_id',
            'method',
            'amount',
            'paid_at',
    ];

   

    public function order()
    {
        return $this->belongsTo(Orders::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shifts::class);
    }
}
