<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryHistory;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->with('inventory', 'category');
            
        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('category_id') && $request->input('category_id') !== '') {
            $query->where('category_id', $request->input('category_id'));
        }
        
        if ($request->has('low_stock') && $request->input('low_stock') === '1') {
            $query->whereHas('inventory', function ($q) {
                $q->where('quantity', '<', 10); // Low stock threshold
            });
        }
        
        $products = $query->orderBy($request->input('sort_by', 'name'), $request->input('sort_direction', 'asc'))
            ->paginate(10)
            ->withQueryString();
            
        return Inertia::render('Admin/Inventory/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'category_id', 'low_stock', 'sort_by', 'sort_direction']),
        ]);
    }
    
    public function updateStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity_change' => 'required|integer|not_in:0',
            'notes' => 'nullable|string',
            'scan_method' => 'required|in:manual,barcode',
        ]);
        
        $inventory = $product->inventory;
        
        // Prevent negative inventory
        if ($validated['quantity_change'] < 0 && $inventory->quantity + $validated['quantity_change'] < 0) {
            return back()->with('error', 'Cannot reduce stock below zero.');
        }
        
        // Update inventory
        $inventory->increment('quantity', $validated['quantity_change']);
        
        // Record history
        InventoryHistory::create([
            'product_id' => $product->id,
            'user_id' => auth()->id(),
            'quantity_change' => $validated['quantity_change'],
            'type' => $validated['quantity_change'] > 0 ? 'in' : 'out',
            'notes' => $validated['notes'],
            'scan_method' => $validated['scan_method'],
        ]);
        
        return back()->with('success', 'Stock updated successfully.');
    }
    
    public function showHistory(Request $request, Product $product)
    {
        $histories = InventoryHistory::where('product_id', $product->id)
            ->with('user')
            ->orderByDesc('created_at')
            ->paginate(10);
            
        return Inertia::render('Admin/Inventory/History', [
            'product' => $product->load('category'),
            'histories' => $histories,
        ]);
    }
}