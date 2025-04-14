<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockPrediction extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'product_id',
        'predicted_date',
        'predicted_quantity',
        'confidence_score',
    ];
    
    protected $casts = [
        'predicted_date' => 'date',
        'confidence_score' => 'float',
    ];
    
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}