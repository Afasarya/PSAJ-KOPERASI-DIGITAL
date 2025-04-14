<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarcodeScan extends Model
{
    use HasFactory;
    
    public $timestamps = false;
    
    protected $fillable = [
        'barcode',
        'product_id',
        'user_id',
        'scan_purpose',
        'scan_result',
        'created_at',
    ];
    
    protected $casts = [
        'created_at' => 'datetime',
    ];
    
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
