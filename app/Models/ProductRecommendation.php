<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductRecommendation extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'base_product_id',
        'recommended_product_id',
        'confidence_score',
    ];
    
    protected $casts = [
        'confidence_score' => 'float',
    ];
    
    public function baseProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'base_product_id');
    }
    
    public function recommendedProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'recommended_product_id');
    }
}