<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\BarcodeScan;
use App\Models\Inventory;
use App\Models\InventoryHistory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockOpnameController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Inventory/StockOpname/Index');
    }
    
    public function process(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.actual_quantity' => 'required|integer|min:0',
            'items.*.system_quantity' => 'required|integer|min:0',
            'items.*.notes' => 'nullable|string',
        ]);
        
        // Process stock opname in a transaction
        DB::transaction(function () use ($validated) {
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $inventory = $product->inventory;
                
                if (!$inventory) {
                    // Create inventory record if it doesn't exist
                    $inventory = Inventory::create([
                        'product_id' => $product->id,
                        'quantity' => $item['actual_quantity'],
                    ]);
                } else {
                    // Calculate difference
                    $difference = $item['actual_quantity'] - $item['system_quantity'];
                    
                    if ($difference != 0) {
                        // Update inventory
                        $inventory->quantity = $item['actual_quantity'];
                        $inventory->save();
                        
                        // Record history
                        InventoryHistory::create([
                            'product_id' => $product->id,
                            'user_id' => auth()->id(),
                            'quantity_change' => $difference,
                            'type' => $difference > 0 ? 'in' : 'out',
                            'notes' => $item['notes'] ?? "Stock opname adjustment",
                            'scan_method' => 'barcode',
                        ]);
                    }
                }
            }
        });
        
        return redirect()->route('admin.inventory.index')
            ->with('success', 'Stock opname berhasil dilakukan.');
    }
}