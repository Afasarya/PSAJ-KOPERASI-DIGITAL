<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\StockPrediction;
use App\Models\Transaction;
use App\Models\TransactionAnomaly;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // Get today's income
        $todayIncome = Transaction::whereDate('created_at', Carbon::today())
            ->where('payment_status', 'paid')
            ->sum('total_amount');
            
        // Get weekly income
        $weeklyIncome = Transaction::whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->where('payment_status', 'paid')
            ->sum('total_amount');
            
        // Get monthly income
        $monthlyIncome = Transaction::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->where('payment_status', 'paid')
            ->sum('total_amount');
            
        // Get best selling products
        $bestSellingProducts = Product::withCount(['transactionItems as total_sold' => function ($query) {
                $query->whereHas('transaction', function ($q) {
                    $q->where('payment_status', 'paid');
                });
            }])
            ->with('category')
            ->orderByDesc('total_sold')
            ->take(5)
            ->get();
            
        // Get low stock products
        $lowStockProducts = Product::whereHas('inventory', function ($query) {
                $query->where('quantity', '<', 10); // Threshold for low stock
            })
            ->with('inventory', 'category')
            ->take(5)
            ->get();
            
        // Get stock predictions
        $stockPredictions = StockPrediction::with('product')
            ->whereDate('predicted_date', '<=', Carbon::now()->addDays(7))
            ->orderBy('predicted_date')
            ->take(5)
            ->get();
            
        // Get transaction anomalies
        $transactionAnomalies = TransactionAnomaly::with('transaction')
            ->where('is_reviewed', false)
            ->orderByDesc('confidence_score')
            ->take(5)
            ->get();
            
        // Get monthly sales data for chart
        $monthlySalesData = $this->getMonthlySalesData();

        return Inertia::render('Admin/Dashboard', [
            'todayIncome' => $todayIncome,
            'weeklyIncome' => $weeklyIncome,
            'monthlyIncome' => $monthlyIncome,
            'bestSellingProducts' => $bestSellingProducts,
            'lowStockProducts' => $lowStockProducts,
            'stockPredictions' => $stockPredictions,
            'transactionAnomalies' => $transactionAnomalies,
            'monthlySalesData' => $monthlySalesData,
        ]);
    }
    
    private function getMonthlySalesData()
    {
        $startDate = Carbon::now()->startOfYear();
        $endDate = Carbon::now()->endOfMonth();
        
        $monthlySales = [];
        $currentDate = $startDate->copy();
        
        while ($currentDate->lte($endDate)) {
            $monthName = $currentDate->format('M');
            $year = $currentDate->format('Y');
            
            $monthlySales[] = [
                'month' => $monthName,
                'year' => $year,
                'sales' => Transaction::whereMonth('created_at', $currentDate->month)
                    ->whereYear('created_at', $currentDate->year)
                    ->where('payment_status', 'paid')
                    ->sum('total_amount'),
            ];
            
            $currentDate->addMonth();
        }
        
        return $monthlySales;
    }
}