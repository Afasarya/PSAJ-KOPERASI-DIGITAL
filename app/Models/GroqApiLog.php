<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroqApiLog extends Model
{
    use HasFactory;
    
    public $timestamps = false;
    
    protected $fillable = [
        'endpoint',
        'operation_type',
        'prompt',
        'response',
        'tokens_used',
        'processing_time',
        'success',
        'error_message',
        'created_at',
    ];
    
    protected $casts = [
        'tokens_used' => 'integer',
        'processing_time' => 'float',
        'success' => 'boolean',
        'created_at' => 'datetime',
    ];
}