<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->with('category', 'inventory');
            
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
        
        if ($request->has('is_active') && $request->input('is_active') !== '') {
            $query->where('is_active', $request->input('is_active') === '1');
        }
        
        $products = $query->orderBy($request->input('sort_by', 'name'), $request->input('sort_direction', 'asc'))
            ->paginate(10)
            ->withQueryString();
            
        $categories = Category::all();
        
        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'is_active', 'sort_by', 'sort_direction']),
        ]);
    }
    
    public function create()
    {
        $categories = Category::all();
        
        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories,
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:products',
            'barcode' => 'nullable|string|max:50|unique:products',
            'description' => 'nullable|string',
            'price_buy' => 'required|numeric|min:0',
            'price_sell' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'initial_stock' => 'nullable|integer|min:0',
        ]);
        
        // Handle image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }
        
        // Create product
        $product = Product::create([
            'name' => $validated['name'],
            'sku' => $validated['sku'],
            'barcode' => $validated['barcode'],
            'description' => $validated['description'] ?? null,
            'price_buy' => $validated['price_buy'],
            'price_sell' => $validated['price_sell'],
            'category_id' => $validated['category_id'],
            'image_path' => $imagePath,
            'is_active' => $validated['is_active'] ?? true,
        ]);
        
        // Create initial inventory
        Inventory::create([
            'product_id' => $product->id,
            'quantity' => $validated['initial_stock'] ?? 0,
        ]);
        
        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }
    
    public function show(Product $product)
    {
        $product->load('category', 'inventory');
        
        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
        ]);
    }
    
    public function edit(Product $product)
    {
        $product->load('category', 'inventory');
        $categories = Category::all();
        
        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }
    
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:products,sku,' . $product->id,
            'barcode' => 'nullable|string|max:50|unique:products,barcode,' . $product->id,
            'description' => 'nullable|string',
            'price_buy' => 'required|numeric|min:0',
            'price_sell' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image_path'] = $imagePath;
        }
        
        // Update product
        $product->update($validated);
        
        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }
    
    public function destroy(Product $product)
    {
        // Check if product has transaction items
        if ($product->transactionItems()->exists()) {
            return redirect()->route('admin.products.index')
                ->with('error', 'Cannot delete product. It has transaction records.');
        }
        
        // Delete image if exists
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }
        
        // Delete inventory
        $product->inventory()->delete();
        
        // Delete product
        $product->delete();
        
        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }
    
    public function searchByBarcode(Request $request)
    {
        $barcode = $request->input('barcode');
        
        $product = Product::where('barcode', $barcode)
            ->with('category', 'inventory')
            ->first();
            
        if ($product) {
            return response()->json([
                'found' => true,
                'product' => $product,
            ]);
        }
        
        return response()->json([
            'found' => false,
        ]);
    }
}
