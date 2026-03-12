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
        return $this->hasMany(Orders::class);
    }

    public function payments()
    {
        return $this->hasMany(Payments::class);
    }
}
