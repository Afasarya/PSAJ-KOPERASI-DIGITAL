<?php

namespace App\Http\Controllers\Barcode;

use App\Http\Controllers\Controller;
use App\Models\BarcodeScan;
use App\Models\Product;
use Illuminate\Http\Request;

class BarcodeScannerController extends Controller
{
    public function scanBarcode(Request $request)
    {
        $validated = $request->validate([
            'barcode' => 'required|string',
            'scan_purpose' => 'required|in:checkout,stock_opname,product_info',
        ]);
        
        $barcode = $validated['barcode'];
        $scanPurpose = $validated['scan_purpose'];
        
        // Find product by barcode
        $product = Product::where('barcode', $barcode)->first();
        
        // Log the scan
        $scan = BarcodeScan::create([
            'barcode' => $barcode,
            'product_id' => $product ? $product->id : null,
            'user_id' => auth()->id(),
            'scan_purpose' => $scanPurpose,
            'scan_result' => $product ? 'success' : 'not_found',
            'created_at' => now(),
        ]);
        
        if ($product) {
            // Load relations based on scan purpose
            if ($scanPurpose === 'checkout' || $scanPurpose === 'product_info') {
                $product->load('inventory', 'category');
            } elseif ($scanPurpose === 'stock_opname') {
                $product->load('inventory');
            }
            
            return response()->json([
                'found' => true,
                'product' => $product,
                'scan_id' => $scan->id,
            ]);
        }
        
        return response()->json([
            'found' => false,
            'scan_id' => $scan->id,
        ]);
    }
}