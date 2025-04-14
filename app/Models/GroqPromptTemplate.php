<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroqPromptTemplate extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'description',
        'template_content',
        'purpose',
        'is_active',
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
    ];
}