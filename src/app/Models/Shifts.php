<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


use Illuminate\Database\Eloquent\Factories\HasFactory;


class Shifts extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'initial_amount',
        'expected_cash_amount',
        'final_cash_amount',
        'status',
        'opened_at',
        'closed_at',
        'difference'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orders()
    {
        return $this->hasMany(Orders::class, 'shift_id');
    }

    public function payments()
    {
        return $this->hasMany(Payments::class, 'shift_id')->where('status', 'paid');
    }

    public function refunds()
    {
        return $this->hasMany(Refunds::class, 'shift_id');
    }

    public function getTotalSales()
    {
        return $this->orders()
            ->where('status', 'paid')
            ->sum('total');
    }




    public function getTotals()
    {
        $total = $this->payments()
            ->whereIn('method', ['cash', 'card', 'qrcode'])
            ->sum('amount');

        return [
            'total' => $total,
        ];
    }



}
