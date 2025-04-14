<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierDashboardController extends Controller
{
    public function index()
    {
        // Get today's sales
        $todaySales = Transaction::whereDate('created_at', Carbon::today())
            ->where('payment_status', 'paid')
            ->where('user_id', auth()->id())
            ->sum('total_amount');
            
        // Get today's transaction count
        $todayTransactionCount = Transaction::whereDate('created_at', Carbon::today())
            ->where('payment_status', 'paid')
            ->where('user_id', auth()->id())
            ->count();
            
        // Get recommended products
        $recommendedProducts = Product::where('is_active', true)
            ->orderByDesc('recommendation_score')
            ->take(5)
            ->with('category')
            ->get();
            
        return Inertia::render('Cashier/Dashboard', [
            'todaySales' => $todaySales,
            'todayTransactionCount' => $todayTransactionCount,
            'recommendedProducts' => $recommendedProducts,
        ]);
    }
}