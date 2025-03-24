<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DishesCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'display_order'];

    public function subcategories()
    {
        return $this->hasMany(DishesCategory::class);
    }

    public function dishes()
    {
        return $this->hasManyThrough(Dishes::class, DishesCategory::class);
    }
}
