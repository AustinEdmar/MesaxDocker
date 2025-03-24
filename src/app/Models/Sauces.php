<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sauces extends Model
{
    use HasFactory;

    protected $fillable = [
        'cuisine_id',
        'name',
        'original_name',
        'description',
        'price',
        'spicy',
        'active'
    ];

    protected $casts = [
        'spicy' => 'boolean',
        'active' => 'boolean'
    ];

    public function cuisine()
    {
        return $this->belongsTo(Cuisine::class);
    }

    public function dishes()
    {
        return $this->belongsToMany(Dishes::class)
            ->withPivot('included_in_price')
            ->withTimestamps();
    }
}
