<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class TransactionController extends Controller
{
    /**
     * Admin transaction index
     */
    public function index(Request $request)
    {
        $filters = $request->only([
            'search',
            'date_start',
            'date_end',
            'payment_status',
            'payment_method_id',
            'user_id',
        ]);
        
        $query = Transaction::query()
            ->with(['paymentMethod', 'user'])
            ->withCount('items')
            ->orderBy('created_at', 'desc');
        
        // Apply filters
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('invoice_number', 'like', "%{$filters['search']}%")
                  ->orWhere('customer_name', 'like', "%{$filters['search']}%");
            });
        }
        
        if (!empty($filters['date_start'])) {
            $query->whereDate('created_at', '>=', $filters['date_start']);
        }
        
        if (!empty($filters['date_end'])) {
            $query->whereDate('created_at', '<=', $filters['date_end']);
        }
        
        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }
        
        if (!empty($filters['payment_method_id'])) {
            $query->where('payment_method_id', $filters['payment_method_id']);
        }
        
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }
        
        $transactions = $query->paginate(10)->withQueryString();
        
        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $filters,
            'payment_methods' => PaymentMethod::where('is_active', true)->get(),
        ]);
    }
    
    /**
     * Cashier transaction index
     */
    public function cashierIndex(Request $request)
    {
        $filters = $request->only([
            'search',
            'date_start',
            'date_end',
            'payment_status',
            'payment_method_id',
        ]);
        
        $query = Transaction::query()
            ->with(['paymentMethod', 'user'])
            ->withCount('items')
            ->where('user_id', auth()->id()) // Only show this cashier's transactions
            ->orderBy('created_at', 'desc');
        
        // Apply filters
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('invoice_number', 'like', "%{$filters['search']}%")
                  ->orWhere('customer_name', 'like', "%{$filters['search']}%");
            });
        }
        
        if (!empty($filters['date_start'])) {
            $query->whereDate('created_at', '>=', $filters['date_start']);
        }
        
        if (!empty($filters['date_end'])) {
            $query->whereDate('created_at', '<=', $filters['date_end']);
        }
        
        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }
        
        if (!empty($filters['payment_method_id'])) {
            $query->where('payment_method_id', $filters['payment_method_id']);
        }
        
        $transactions = $query->paginate(10)->withQueryString();
        
        return Inertia::render('Cashier/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $filters,
            'payment_methods' => PaymentMethod::where('is_active', true)->get(),
        ]);
    }
    
    /**
     * Admin show transaction
     */
    public function show($id)
    {
        $transaction = Transaction::with([
            'items.product',
            'user',
            'paymentMethod',
            'anomaly',
        ])->findOrFail($id);
        
        // Check if this is an Inertia request (for full page view)
        if(request()->wantsJson()) {
            return response()->json([
                'transaction' => $transaction,
            ]);
        }
        
        // For full page rendering
        return Inertia::render('Admin/Transactions/Show', [
            'id' => $id,
        ]);
    }
    
    /**
     * Cashier show transaction
     */
    public function cashierShow($id)
    {
        $transaction = Transaction::with([
            'items.product',
            'user',
            'paymentMethod',
        ])->findOrFail($id);
        
        // Check if user has permission to view this transaction
        if ($transaction->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Check if this is an API request
        if(request()->wantsJson()) {
            return response()->json([
                'transaction' => $transaction,
            ]);
        }
        
        // For full page rendering
        return Inertia::render('Cashier/Transactions/Show', [
            'id' => $id,
        ]);
    }
    
    /**
     * Print transaction receipt (admin)
     */
    public function print($id)
    {
        $transaction = Transaction::with([
            'items.product',
            'user',
            'paymentMethod',
        ])->findOrFail($id);
        
        // Generate receipt HTML
        $receipt = view('receipts.transaction', [
            'transaction' => $transaction,
        ])->render();
        
        // For API/Axios requests, return HTML
        if(request()->wantsJson() || request()->ajax()) {
            return response()->json([
                'receipt_html' => $receipt,
            ]);
        }
        
        // For direct browser access (when opened in new tab)
        return response($receipt)
            ->header('Content-Type', 'text/html');
    }
    
    /**
     * Print transaction receipt (cashier)
     */
    public function cashierPrint($id)
    {
        $transaction = Transaction::with([
            'items.product',
            'user',
            'paymentMethod',
        ])->findOrFail($id);
        
        // Check if user has permission to view this transaction
        if ($transaction->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Generate receipt HTML
        $receipt = view('receipts.transaction', [
            'transaction' => $transaction,
        ])->render();
        
        // For API/Axios requests, return HTML
        if(request()->wantsJson() || request()->ajax()) {
            return response()->json([
                'receipt_html' => $receipt,
            ]);
        }
        
        // For direct browser access (when opened in new tab)
        return response($receipt)
            ->header('Content-Type', 'text/html');
    }
    
    /**
     * Download transaction invoice (admin)
     */
    public function download($id)
    {
        $transaction = Transaction::with([
            'items.product',
            'user',
            'paymentMethod',
        ])->findOrFail($id);
        
        // Generate PDF invoice directly
        $pdf = Pdf::loadView('invoices.transaction', [
            'transaction' => $transaction,
        ]);
        
        return $pdf->download("Invoice-{$transaction->invoice_number}.pdf");
    }
    
    /**
     * Download transaction invoice (cashier)
     */
    public function cashierDownload($id)
    {
        $transaction = Transaction::with([
            'items.product',
            'user',
            'paymentMethod',
        ])->findOrFail($id);
        
        // Check if user has permission to view this transaction
        if ($transaction->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Generate PDF invoice directly
        $pdf = Pdf::loadView('invoices.transaction', [
            'transaction' => $transaction,
        ]);
        
        return $pdf->download("Invoice-{$transaction->invoice_number}.pdf");
    }
}