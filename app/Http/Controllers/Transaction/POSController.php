<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryHistory;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\ProductRecommendation;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Services\GroqService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class POSController extends Controller
{
    protected $groqService;
    
    public function __construct(GroqService $groqService)
    {
        $this->groqService = $groqService;
    }
    
    public function index()
    {
        $paymentMethods = PaymentMethod::where('is_active', true)->get();
        
        return Inertia::render('Cashier/POS/Index', [
            'paymentMethods' => $paymentMethods,
        ]);
    }
    
    public function searchProducts(Request $request)
    {
        $search = $request->input('search');
        
        $products = Product::where('is_active', true)
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', $search);
            })
            ->with('inventory')
            ->limit(10)
            ->get();
            
        return response()->json($products);
    }
    
    public function getProductRecommendations(Request $request)
    {
        $productId = $request->input('product_id');
        
        // Get recommendations from database
        $recommendations = ProductRecommendation::where('base_product_id', $productId)
            ->with('recommendedProduct.inventory')
            ->orderByDesc('confidence_score')
            ->limit(5)
            ->get()
            ->pluck('recommendedProduct');
            
        // If no recommendations, get from Groq AI
        if ($recommendations->isEmpty()) {
            try {
                // This would be implemented in the GroqService
                $recommendations = $this->groqService->getProductRecommendations($productId);
            } catch (\Exception $e) {
                // Fallback to random products if AI fails
                $recommendations = Product::where('id', '!=', $productId)
                    ->where('is_active', true)
                    ->inRandomOrder()
                    ->limit(5)
                    ->with('inventory')
                    ->get();
            }
        }
        
        return response()->json([
            'recommendations' => $recommendations,
        ]);
    }
    
    public function processTransaction(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.subtotal' => 'required|numeric|min:0',
            'items.*.is_recommended' => 'boolean',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'customer_name' => 'nullable|string|max:255',
            'total_amount' => 'required|numeric|min:0',
        ]);
        
        // Start transaction
        return DB::transaction(function () use ($validated) {
            // Create transaction
            $transaction = Transaction::create([
                'invoice_number' => $this->generateInvoiceNumber(),
                'user_id' => auth()->id(),
                'customer_name' => $validated['customer_name'] ?? null,
                'total_amount' => $validated['total_amount'],
                'payment_method_id' => $validated['payment_method_id'],
                'payment_status' => 'paid', // Assuming direct payment
            ]);
            
            // Create transaction items and update inventory
            foreach ($validated['items'] as $item) {
                // Create transaction item
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['subtotal'],
                    'is_recommended' => $item['is_recommended'] ?? false,
                ]);
                
                // Update inventory
                $inventory = Inventory::where('product_id', $item['product_id'])->first();
                $inventory->decrement('quantity', $item['quantity']);
                
                // Record inventory history
                InventoryHistory::create([
                    'product_id' => $item['product_id'],
                    'user_id' => auth()->id(),
                    'quantity_change' => -$item['quantity'],
                    'type' => 'out',
                    'notes' => 'Sale transaction #' . $transaction->invoice_number,
                    'scan_method' => 'manual', // Assuming manual entry
                ]);
            }
            
            // Process anomaly detection asynchronously (would be implemented with a job in production)
            // $this->groqService->detectAnomalies($transaction);
            
            return response()->json([
                'success' => true,
                'transaction' => $transaction->load('items.product'),
            ]);
        });
    }
    
    private function generateInvoiceNumber()
    {
        $prefix = 'INV';
        $date = Carbon::now()->format('Ymd');
        $count = Transaction::whereDate('created_at', Carbon::today())->count() + 1;
        $suffix = str_pad($count, 4, '0', STR_PAD_LEFT);
        
        return "{$prefix}-{$date}-{$suffix}";
    }
    
    public function registerNewProduct(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50|unique:products',
            'barcode' => 'required|string|max:50|unique:products',
            'price_buy' => 'required|numeric|min:0',
            'price_sell' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'initial_stock' => 'nullable|integer|min:0',
        ]);
        
        // Generate SKU if not provided
        if (empty($validated['sku'])) {
            $validated['sku'] = 'SKU-' . Str::upper(Str::random(8));
        }
        
        // Create product
        $product = Product::create([
            'name' => $validated['name'],
            'sku' => $validated['sku'],
            'barcode' => $validated['barcode'],
            'price_buy' => $validated['price_buy'],
            'price_sell' => $validated['price_sell'],
            'category_id' => $validated['category_id'],
            'is_active' => true,
        ]);
        
        // Create inventory
        Inventory::create([
            'product_id' => $product->id,
            'quantity' => $validated['initial_stock'] ?? 0,
        ]);
        
        $product->load('inventory', 'category');
        
        return response()->json([
            'success' => true,
            'product' => $product,
        ]);
    }
}