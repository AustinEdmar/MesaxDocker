<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tables extends Model
{
    use HasFactory;
    protected $fillable = ['number', 'status'];

    public function orders()
    {
        return $this->hasMany(Orders::class);
    }
}
