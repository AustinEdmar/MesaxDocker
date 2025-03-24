<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    
    protected $fillable = ['name', 'description', 'price', 'sub_category_id', 'image_path'];

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }

    public function stock()
    {
        return $this->hasOne(Stock::class);
    }
}
