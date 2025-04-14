<?php

namespace App\Http\Controllers\Financial;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\FinancialReportExport;

class FinancialReportController extends Controller
{
    public function index(Request $request)
    {
        // Default to current month if no dates provided
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : Carbon::now()->startOfMonth();
            
        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfMonth();
            
        // Get sales data
        $salesData = $this->getSalesData($startDate, $endDate);
        
        // Get profit data
        $profitData = $this->getProfitData($startDate, $endDate);
        
        // Get sales by category
        $salesByCategory = $this->getSalesByCategory($startDate, $endDate);
        
        // Get top selling products
        $topSellingProducts = $this->getTopSellingProducts($startDate, $endDate);
        
        return Inertia::render('Admin/Financial/Index', [
            'salesData' => $salesData,
            'profitData' => $profitData,
            'salesByCategory' => $salesByCategory,
            'topSellingProducts' => $topSellingProducts,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
        ]);
    }
    
    private function getSalesData($startDate, $endDate)
    {
        $dailySales = [];
        $currentDate = $startDate->copy();
        
        while ($currentDate->lte($endDate)) {
            $dailySales[] = [
                'date' => $currentDate->format('Y-m-d'),
                'sales' => Transaction::whereDate('created_at', $currentDate)
                    ->where('payment_status', 'paid')
                    ->sum('total_amount'),
            ];
            
            $currentDate->addDay();
        }
        
        return $dailySales;
    }
    
    private function getProfitData($startDate, $endDate)
    {
        // Get total sales
        $totalSales = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->sum('total_amount');
            
        // Get total cost
        $totalCost = 0;
        
        $transactions = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->with('items.product')
            ->get();
            
        foreach ($transactions as $transaction) {
            foreach ($transaction->items as $item) {
                $totalCost += $item->product->price_buy * $item->quantity;
            }
        }
        
        // Calculate profit
        $profit = $totalSales - $totalCost;
        
        return [
            'total_sales' => $totalSales,
            'total_cost' => $totalCost,
            'profit' => $profit,
            'profit_margin' => $totalSales > 0 ? round(($profit / $totalSales) * 100, 2) : 0,
        ];
    }
    
    private function getSalesByCategory($startDate, $endDate)
    {
        return DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereBetween('transactions.created_at', [$startDate, $endDate])
            ->where('transactions.payment_status', 'paid')
            ->select('categories.name', DB::raw('SUM(transaction_items.subtotal) as total'))
            ->groupBy('categories.name')
            ->orderByDesc('total')
            ->get();
    }
    
    private function getTopSellingProducts($startDate, $endDate)
    {
        return DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_items.product_id', '=', 'products.id')
            ->whereBetween('transactions.created_at', [$startDate, $endDate])
            ->where('transactions.payment_status', 'paid')
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(transaction_items.quantity) as quantity_sold'),
                DB::raw('SUM(transaction_items.subtotal) as total_sales')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('quantity_sold')
            ->limit(10)
            ->get();
    }
    
    public function exportPdf(Request $request)
    {
        $startDate = Carbon::parse($request->input('start_date'));
        $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        
        $salesData = $this->getSalesData($startDate, $endDate);
        $profitData = $this->getProfitData($startDate, $endDate);
        $salesByCategory = $this->getSalesByCategory($startDate, $endDate);
        $topSellingProducts = $this->getTopSellingProducts($startDate, $endDate);
        
        $pdf = PDF::loadView('reports.financial', [
            'salesData' => $salesData,
            'profitData' => $profitData,
            'salesByCategory' => $salesByCategory,
            'topSellingProducts' => $topSellingProducts,
            'startDate' => $startDate->format('d M Y'),
            'endDate' => $endDate->format('d M Y'),
        ]);
        
        return $pdf->download('financial_report_' . $startDate->format('Y-m-d') . '_' . $endDate->format('Y-m-d') . '.pdf');
    }
    
    public function exportExcel(Request $request)
    {
        $startDate = Carbon::parse($request->input('start_date'));
        $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        
        return Excel::download(
            new FinancialReportExport($startDate, $endDate),
            'financial_report_' . $startDate->format('Y-m-d') . '_' . $endDate->format('Y-m-d') . '.xlsx'
        );
    }
}