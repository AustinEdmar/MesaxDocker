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
        'received',
        'change',
        'status',
        'user_id'
    ];

    public function order()
    {
        return $this->belongsTo(Orders::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shifts::class);
    }

    // ✅ payment tem vários refunds
    public function refunds()
    {
        return $this->hasMany(Refunds::class, 'payment_id');
    }

    // ✅ payment tem um único user ( quem recebeu)
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

}
