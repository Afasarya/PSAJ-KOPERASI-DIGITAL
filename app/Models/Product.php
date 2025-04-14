<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'barcode',
        'description',
        'price_buy',
        'price_sell',
        'category_id',
        'image_path',
        'is_active',
        'recommendation_score',
    ];
    
    protected $casts = [
        'price_buy' => 'decimal:2',
        'price_sell' => 'decimal:2',
        'is_active' => 'boolean',
        'recommendation_score' => 'float',
    ];
    
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
    
    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class);
    }
    
    public function inventoryHistories(): HasMany
    {
        return $this->hasMany(InventoryHistory::class);
    }
    
    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
    
    public function stockPredictions(): HasMany
    {
        return $this->hasMany(StockPrediction::class);
    }
    
    public function salesForecasts(): HasMany
    {
        return $this->hasMany(SalesForecast::class);
    }
    
    public function barcodeScans(): HasMany
    {
        return $this->hasMany(BarcodeScan::class);
    }
    
    public function baseProductRecommendations(): HasMany
    {
        return $this->hasMany(ProductRecommendation::class, 'base_product_id');
    }
    
    public function recommendedProductRecommendations(): HasMany
    {
        return $this->hasMany(ProductRecommendation::class, 'recommended_product_id');
    }
}