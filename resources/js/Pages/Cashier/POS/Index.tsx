// resources/js/Pages/Cashier/POS/Index.tsx
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import CashierLayout from '@/Layouts/CashierLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/Components/ui/badge';
import { 
  BarcodeIcon, 
  Minus, 
  Plus, 
  Search, 
  ShoppingCart, 
  Trash2, 
  CreditCard,
  Receipt,
  PackagePlus
} from 'lucide-react';
import axios from 'axios';
import BarcodeScanner from '@/Components/BarcodeScanner';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import NewProductForm from './NewProductForm';
import PaymentModal from './PaymentModal';

interface PaymentMethod {
  id: number;
  name: string;
}

interface POSProps {
  paymentMethods: PaymentMethod[];
}

interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  price_buy: number;
  price_sell: number;
  image_path: string | null;
  is_active: boolean;
  inventory: {
    id: number;
    quantity: number;
  };
  category: {
    id: number;
    name: string;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
  is_recommended: boolean;
}

const POS: React.FC<POSProps> = ({ paymentMethods }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'destructive' | 'warning'; message: string } | null>(null);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');

  // Calculate total whenever cart changes
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    setTotal(newTotal);
  }, [cart]);

  // Search products function
  const searchProducts = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.post(route('cashier.pos.search-products'), {
        search: searchTerm,
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
      setAlert({
        type: 'destructive',
        message: 'Gagal mencari produk. Silakan coba lagi.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts();
  };

  // Handle adding product to cart
  const addToCart = (product: Product, isRecommended: boolean = false) => {
    // Check if product has inventory
    if (!product.inventory || product.inventory.quantity <= 0) {
      setAlert({
        type: 'warning',
        message: `${product.name} tidak memiliki stok.`,
      });
      return;
    }

    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);

    if (existingItemIndex >= 0) {
      // Product already in cart, update quantity
      const updatedCart = [...cart];
      const item = updatedCart[existingItemIndex];

      // Check if we have enough inventory
      if (item.quantity >= product.inventory.quantity) {
        setAlert({
          type: 'warning',
          message: `Stok ${product.name} tidak mencukupi.`,
        });
        return;
      }

      item.quantity += 1;
      item.subtotal = item.quantity * product.price_sell;
      setCart(updatedCart);
    } else {
      // Add new product to cart
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          subtotal: product.price_sell,
          is_recommended: isRecommended,
        },
      ]);

      // If this is the first item in cart, fetch recommendations
      if (cart.length === 0) {
        getProductRecommendations(product.id);
      }
    }

    // Clear search if done via search
    if (!isRecommended) {
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = cart.map(item => {
      if (item.product.id === productId) {
        // Check inventory
        if (newQuantity > item.product.inventory.quantity) {
          setAlert({
            type: 'warning',
            message: `Stok ${item.product.name} tidak mencukupi.`,
          });
          return item;
        }
        
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * item.product.price_sell,
        };
      }
      return item;
    });

    setCart(updatedCart);
  };

  // Handle barcode scan result
  const handleBarcodeDetected = async (barcode: string) => {
    setLastScannedBarcode(barcode);
    setIsScannerOpen(false);

    try {
      const response = await axios.post(route('barcode.scan'), {
        barcode,
        scan_purpose: 'checkout',
      });

      if (response.data.found) {
        const product = response.data.product;
        addToCart(product);
        setAlert({
          type: 'success',
          message: `${product.name} telah ditambahkan ke keranjang.`,
        });
      } else {
        setIsNewProductOpen(true);
      }
    } catch (error) {
      console.error('Error processing barcode:', error);
      setAlert({
        type: 'destructive',
        message: 'Gagal memproses barcode. Silakan coba lagi.',
      });
    }
  };

  // Get product recommendations
  const getProductRecommendations = async (productId: number) => {
    try {
      const response = await axios.post(route('cashier.pos.get-product-recommendations'), {
        product_id: productId,
      });
      setRecommendedProducts(response.data.recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      // No need to show alert for recommendations failure
    }
  };

  // Handle registering new product from barcode
  const handleRegisterNewProduct = async (formData: any) => {
    try {
      setIsProcessing(true);
      const response = await axios.post(route('cashier.pos.register-new-product'), {
        ...formData,
        barcode: lastScannedBarcode,
      });

      if (response.data.success) {
        setIsNewProductOpen(false);
        addToCart(response.data.product);
        setAlert({
          type: 'success',
          message: `Produk baru "${response.data.product.name}" telah ditambahkan.`,
        });
      }
    } catch (error) {
      console.error('Error registering new product:', error);
      setAlert({
        type: 'destructive',
        message: 'Gagal mendaftarkan produk baru. Silakan coba lagi.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Process the transaction
  const processTransaction = async (paymentMethodId: number) => {
    if (cart.length === 0) return;

    try {
      setIsProcessing(true);
      
      const items = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price_sell,
        subtotal: item.subtotal,
        is_recommended: item.is_recommended,
      }));

      const response = await axios.post(route('cashier.pos.process-transaction'), {
        items,
        payment_method_id: paymentMethodId,
        customer_name: customerName.trim() || null,
        total_amount: total,
      });

      if (response.data.success) {
        setAlert({
          type: 'success',
          message: 'Transaksi berhasil diproses.',
        });
        
        // Clear cart and related states
        setCart([]);
        setRecommendedProducts([]);
        setCustomerName('');
        
        // Close payment modal
        setIsPaymentModalOpen(false);
        
        // Print receipt (implementation depends on your setup)
        // This could open a new window with receipt or use a receipt printer library
        // For now, we'll just log the transaction
        console.log('Transaction completed:', response.data.transaction);
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      setAlert({
        type: 'destructive',
        message: 'Gagal memproses transaksi. Silakan coba lagi.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CashierLayout title="Kasir (POS)">
      <Head title="Kasir (POS)" />

      <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row">
        {/* Left Side - Products */}
        <div className="md:w-2/3 p-4 flex flex-col overflow-hidden">
          {/* Search and Scan */}
          <div className="flex space-x-2 mb-4">
            <div className="flex-1">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari produk berdasarkan nama atau SKU..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsScannerOpen(true)}
            >
              <BarcodeIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Alert */}
          {alert && (
            <Alert 
              variant={alert.type} 
              className="mb-4"
            >
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Hasil Pencarian</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((product) => (
                  <Card 
                    key={product.id} 
                    className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <div className="h-32 bg-muted flex items-center justify-center">
                      {product.image_path ? (
                        <img 
                          src={`/storage/${product.image_path}`} 
                          alt={product.name}
                          className="h-full object-cover"
                        />
                      ) : (
                        <PackagePlus className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <CardContent className="p-3">
                      <div className="font-medium truncate">{product.name}</div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-sm font-semibold">{formatCurrency(product.price_sell)}</div>
                        <div className="text-xs text-muted-foreground">
                          Stok: {product.inventory?.quantity || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Products */}
          {recommendedProducts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Rekomendasi Produk</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addToCart(product, true)}
                  >
                    <div className="h-32 bg-muted flex items-center justify-center relative">
                      {product.image_path ? (
                        <img 
                          src={`/storage/${product.image_path}`} 
                          alt={product.name}
                          className="h-full object-cover"
                        />
                      ) : (
                        <PackagePlus className="h-12 w-12 text-muted-foreground" />
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="success">Rekomendasi</Badge>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="font-medium truncate">{product.name}</div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-sm font-semibold">{formatCurrency(product.price_sell)}</div>
                        <div className="text-xs text-muted-foreground">
                          Stok: {product.inventory?.quantity || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {searchResults.length === 0 && recommendedProducts.length === 0 && !isSearching && (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Keranjang Kosong</h3>
              <p className="text-muted-foreground mb-4">
                Cari produk di atas atau gunakan scanner barcode untuk menambahkan produk ke keranjang
              </p>
              <div className="flex space-x-4">
                <Button onClick={() => setIsScannerOpen(true)}>
                  <BarcodeIcon className="h-4 w-4 mr-2" />
                  Scan Barcode
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Cart */}
        <div className="md:w-1/3 border-l bg-card flex flex-col h-full">
          {/* Cart Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Keranjang</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCart([])}
                disabled={cart.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Kosongkan
              </Button>
            </div>
            <div className="mt-2">
              <Input
                placeholder="Nama Pelanggan (Opsional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Keranjang kosong
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div 
                    key={item.product.id} 
                    className={`p-3 border rounded-md ${item.is_recommended ? 'border-green-500' : ''}`}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium truncate flex-1">{item.product.name}</div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatCurrency(item.product.price_sell)} x {item.quantity}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.inventory.quantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="font-semibold">{formatCurrency(item.subtotal)}</div>
                    </div>
                    {item.is_recommended && (
                      <div className="mt-1">
                        <Badge variant="success" className="text-xs">Rekomendasi</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Total */}
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-bold">{formatCurrency(total)}</span>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              disabled={cart.length === 0 || isProcessing}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Proses Pembayaran
            </Button>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner 
          onDetected={handleBarcodeDetected} 
          onClose={() => setIsScannerOpen(false)}
          scanPurpose="checkout"
        />
      )}

      {/* New Product Form Modal */}
      {isNewProductOpen && (
        <NewProductForm 
          barcode={lastScannedBarcode || ''}
          onSubmit={handleRegisterNewProduct}
          onCancel={() => setIsNewProductOpen(false)}
          isProcessing={isProcessing}
        />
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          total={total}
          paymentMethods={paymentMethods}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={processTransaction}
          isProcessing={isProcessing}
        />
      )}
    </CashierLayout>
  );
};

export default POS;