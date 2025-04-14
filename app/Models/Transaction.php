<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'invoice_number',
        'user_id',
        'customer_name',
        'total_amount',
        'payment_method_id',
        'payment_status',
        'anomaly_score',
    ];
    
    protected $casts = [
        'total_amount' => 'decimal:2',
        'anomaly_score' => 'float',
    ];
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }
    
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
    
    public function financialRecord(): HasOne
    {
        return $this->hasOne(FinancialRecord::class);
    }
    
    public function anomaly(): HasOne
    {
        return $this->hasOne(TransactionAnomaly::class);
    }
}