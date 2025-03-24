<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dish_variations extends Model
{
    use HasFactory;

    protected $fillable = ['dish_id', 'name', 'description', 'price'];

    public function dish()
    {
        return $this->belongsTo(Dishes::class);
    }
}
