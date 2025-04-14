<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionAnomaly extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'transaction_id',
        'anomaly_type',
        'confidence_score',
        'is_reviewed',
        'reviewed_by',
    ];
    
    protected $casts = [
        'confidence_score' => 'float',
        'is_reviewed' => 'boolean',
    ];
    
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
    
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
