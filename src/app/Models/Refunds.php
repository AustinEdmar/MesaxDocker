<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Refunds extends Model
{

    protected $fillable = [

        'order_id',
        'shift_id',
        'payment_id',
        'user_id',
        'amount',
        'type',
        'reason',

    ];

    // refund pertence ao pedido
    public function order()
    {
        return $this->belongsTo(Orders::class, 'order_id');
    }

    public function shift()
    {
        return $this->belongsTo(Shifts::class, 'shift_id');
    }

    // refund pertence ao pagamento
    public function payment()
    {
        return $this->belongsTo(Payments::class, 'payment_id');
    }

    // quem fez o estorno
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
