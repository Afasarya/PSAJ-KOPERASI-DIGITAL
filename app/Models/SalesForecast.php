<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesForecast extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'product_id',
        'forecast_date',
        'predicted_sales',
        'confidence_score',
    ];
    
    protected $casts = [
        'forecast_date' => 'date',
        'confidence_score' => 'float',
    ];
    
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}