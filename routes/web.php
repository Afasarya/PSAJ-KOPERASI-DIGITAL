<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\AI\GroqAIController;
use App\Http\Controllers\Barcode\BarcodeScannerController;
use App\Http\Controllers\Dashboard\AdminDashboardController;
use App\Http\Controllers\Dashboard\CashierDashboardController;
use App\Http\Controllers\Financial\FinancialReportController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Inventory\StockOpnameController;
use App\Http\Controllers\Product\CategoryController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\Settings\SettingsController;
use App\Http\Controllers\Transaction\POSController;
use App\Http\Controllers\Transaction\TransactionController;
use App\Http\Controllers\User\UserController;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsCashier;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Auth routes

Route::middleware('guest')->group(function () {
    Route::get('/', [AuthenticatedSessionController::class, 'create'])
         ->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

// Pastikan route logout sudah terdaftar
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
         ->name('logout');
    
    // Route lain yang memerlukan autentikasi
});
    // Profile routes
    Route::get('/profile', function () {
        return Inertia::render('Profile/Edit');
    })->name('profile.edit');
    
    // Admin routes
    Route::middleware(EnsureUserIsAdmin::class)->prefix('admin')->name('admin.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        
        // Products
        Route::resource('products', ProductController::class);
        Route::post('/products/search-barcode', [ProductController::class, 'searchByBarcode'])->name('products.search-barcode');
        
        // Categories
        Route::resource('categories', CategoryController::class);
        
        // Inventory
        Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::post('/inventory/{product}/update-stock', [InventoryController::class, 'updateStock'])->name('inventory.update-stock');
        Route::get('/inventory/{product}/history', [InventoryController::class, 'showHistory'])->name('inventory.history');
        
        // Stock Opname
        Route::get('/stock-opname', [StockOpnameController::class, 'index'])->name('stock-opname.index');
        Route::post('/stock-opname/process', [StockOpnameController::class, 'process'])->name('stock-opname.process');
        
        // Users
        Route::resource('users', UserController::class);
        
        // Transactions
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
        Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
        
        // Financial Reports
        Route::get('/financial-reports', [FinancialReportController::class, 'index'])->name('financial-reports.index');
        Route::get('/financial-reports/export-pdf', [FinancialReportController::class, 'exportPdf'])->name('financial-reports.export-pdf');
        Route::get('/financial-reports/export-excel', [FinancialReportController::class, 'exportExcel'])->name('financial-reports.export-excel');
        
        // Groq AI Management
        Route::get('/groq-ai', [GroqAIController::class, 'index'])->name('groq-ai.index');
        Route::get('/groq-ai/usage', [GroqAIController::class, 'usage'])->name('groq-ai.usage');
        Route::get('/groq-ai/templates', [GroqAIController::class, 'templates'])->name('groq-ai.templates');
        Route::get('/groq-ai/templates/{template}/edit', [GroqAIController::class, 'editTemplate'])->name('groq-ai.templates.edit');
        Route::put('/groq-ai/templates/{template}', [GroqAIController::class, 'updateTemplate'])->name('groq-ai.templates.update');
        Route::get('/groq-ai/anomalies', [GroqAIController::class, 'anomalies'])->name('groq-ai.anomalies');
        Route::put('/groq-ai/anomalies/{anomaly}/review', [GroqAIController::class, 'reviewAnomaly'])->name('groq-ai.anomalies.review');
        
        // Settings
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::get('/settings/payment-methods', [SettingsController::class, 'paymentMethods'])->name('settings.payment-methods');
        Route::post('/settings/payment-methods', [SettingsController::class, 'updatePaymentMethods'])->name('settings.payment-methods.update');
    });
    
    // Cashier routes
    Route::middleware(EnsureUserIsCashier::class)->prefix('cashier')->name('cashier.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [CashierDashboardController::class, 'index'])->name('dashboard');
        
        // POS
        Route::get('/pos', [POSController::class, 'index'])->name('pos.index');
        Route::post('/pos/search-products', [POSController::class, 'searchProducts'])->name('pos.search-products');
        Route::post('/pos/get-product-recommendations', [POSController::class, 'getProductRecommendations'])->name('pos.get-product-recommendations');
        Route::post('/pos/process-transaction', [POSController::class, 'processTransaction'])->name('pos.process-transaction');
        Route::post('/pos/register-new-product', [POSController::class, 'registerNewProduct'])->name('pos.register-new-product');
        
        // Transactions
        Route::get('/transactions', [TransactionController::class, 'cashierIndex'])->name('transactions.index');
        Route::get('/transactions/{transaction}', [TransactionController::class, 'cashierShow'])->name('transactions.show');
        
        // Groq AI Assistant
        Route::get('/groq-assistant', [GroqAIController::class, 'assistant'])->name('groq-assistant'); // Tambahkan route GET ini
        Route::post('/groq-assistant/chat', [GroqAIController::class, 'chat'])->name('groq-assistant.chat');
    });
    
// Shared routes
Route::post('/barcode/scan', [BarcodeScannerController::class, 'scanBarcode'])->name('barcode.scan');