<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cuisine extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function dishes()
    {
        return $this->hasMany(Dishes::class);
    }

    public function sides()
    {
        return $this->hasMany(Sides::class);
    }

    public function sauces()
    {
        return $this->hasMany(Sauces::class);
    }
}
