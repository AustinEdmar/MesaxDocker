<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dishes extends Model
{
    use HasFactory;
    protected $fillable = [
        'cuisine_id',
        'dishes_sub_category_id',
        'name',
        'original_name',
        'slug',
        'description',
        'price',
        'spicy',
        'vegetarian',
        'active',
        'serving_size',
        'allergens'
    ];

    protected $casts = [
        'allergens' => 'array',
        'spicy' => 'boolean',
        'vegetarian' => 'boolean',
        'active' => 'boolean'
    ];

    public function cuisine()
    {
        return $this->belongsTo(Cuisine::class);
    }

    public function subcategory()
    {
        return $this->belongsTo(DishesSubCategory::class);
    }

    public function variations()
    {
        return $this->hasMany(DishVariation::class);
    }

    public function sides()
    {
        return $this->belongsToMany(Sides::class)
            ->withPivot('included_in_price')
            ->withTimestamps();
    }

    public function sauces()
    {
        return $this->belongsToMany(Sauces::class)
            ->withPivot('included_in_price')
            ->withTimestamps();
    }
}
