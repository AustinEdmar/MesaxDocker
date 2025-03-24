<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DishesSubCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'dishes_category_id',
        'name',
        'slug',
        'description',
        'display_order'
    ];

    public function category()
    {
        return $this->belongsTo(DishesCategory::class);
    }

    public function dishes()
    {
        return $this->hasMany(Dishes::class);
    }
}
