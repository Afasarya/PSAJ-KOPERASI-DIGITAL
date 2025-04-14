import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { 
  ArrowLeft, 
  BarcodeIcon, 
  CheckCircle, 
  Clipboard, 
  HelpCircle, 
  Loader2, 
  Minus, 
  Package, 
  Plus, 
  RefreshCw, 
  Save, 
  Trash, 
  X
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Textarea } from '@/Components/ui/text-area';
import BarcodeScanner from '@/Components/BarcodeScanner';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import axios from 'axios';

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

interface StockOpnameItem {
  product: Product;
  system_quantity: number;
  actual_quantity: number;
  notes: string;
}

const StockOpnameIndex: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [opnameItems, setOpnameItems] = useState<StockOpnameItem[]>([]);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    items: [] as Array<{
      product_id: number;
      system_quantity: number;
      actual_quantity: number;
      notes: string;
    }>,
  });

  // Handle barcode scan
  const handleBarcodeScan = async (barcode: string) => {
    setIsScannerOpen(false);
    
    try {
      const response = await axios.post(route('barcode.scan'), {
        barcode,
        scan_purpose: 'stock_opname',
      });
      
      if (response.data.found) {
        const product = response.data.product;
        
        // Check if product is already in opname items
        const existingItemIndex = opnameItems.findIndex(
          (item) => item.product.id === product.id
        );
        
        if (existingItemIndex >= 0) {
          setAlert({
            type: 'warning',
            message: `Product "${product.name}" already added to stock opname list.`,
          });
          return;
        }
        
        // Add product to opname items
        setOpnameItems([
          ...opnameItems,
          {
            product,
            system_quantity: product.inventory?.quantity || 0,
            actual_quantity: product.inventory?.quantity || 0,
            notes: '',
          },
        ]);
        
        setAlert({
          type: 'success',
          message: `Product "${product.name}" added to stock opname list.`,
        });
      } else {
        setAlert({
          type: 'warning',
          message: `Product with barcode ${barcode} not found.`,
        });
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      setAlert({
        type: 'error',
        message: 'Failed to process barcode scan. Please try again.',
      });
    }
  };

  // Handle remove item from opname list
  const handleRemoveItem = (productId: number) => {
    setOpnameItems(opnameItems.filter((item) => item.product.id !== productId));
  };

  // Handle actual quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    setOpnameItems(
      opnameItems.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            actual_quantity: quantity,
          };
        }
        return item;
      })
    );
  };

  // Handle notes change
  const handleNotesChange = (productId: number, notes: string) => {
    setOpnameItems(
      opnameItems.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            notes,
          };
        }
        return item;
      })
    );
  };

  // Handle submit stock opname
  const handleSubmit = () => {
    // Check if there are any items in the list
    if (opnameItems.length === 0) {
      setAlert({
        type: 'warning',
        message: 'No items in stock opname list. Please scan products before submitting.',
      });
      return;
    }

    // Confirm if there are difference in quantities
    const hasDifferences = opnameItems.some(
      (item) => item.system_quantity !== item.actual_quantity
    );

    if (!hasDifferences) {
      setAlert({
        type: 'warning',
        message: 'No differences detected between system and actual quantities. Do you still want to proceed?',
      });
    }

    // Prepare data for submission
    const items = opnameItems.map((item) => ({
      product_id: item.product.id,
      system_quantity: item.system_quantity,
      actual_quantity: item.actual_quantity,
      notes: item.notes,
    }));

    setData({ items });
    post(route('admin.stock-opname.process'), {
      onSuccess: () => {
        // This will redirect to inventory index on success with flash message
      },
      onError: (errors) => {
        console.error('Error submitting stock opname:', errors);
        setAlert({
          type: 'error',
          message: 'Failed to process stock opname. Please try again.',
        });
      },
    });
  };

  // Calculate statistics
  const getStatistics = () => {
    const totalItems = opnameItems.length;
    const itemsWithDifference = opnameItems.filter(
      (item) => item.system_quantity !== item.actual_quantity
    ).length;
    const totalExcess = opnameItems.reduce(
      (sum, item) => sum + Math.max(0, item.actual_quantity - item.system_quantity),
      0
    );
    const totalShortage = opnameItems.reduce(
      (sum, item) => sum + Math.max(0, item.system_quantity - item.actual_quantity),
      0
    );

    return {
      totalItems,
      itemsWithDifference,
      totalExcess,
      totalShortage,
    };
  };

  const stats = getStatistics();

  return (
    <AdminLayout title="Stock Opname">
      <Head title="Stock Opname" />

      <div className="mb-6">
        <Button variant="outline" asChild>
          <a href={route('admin.inventory.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </a>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Clipboard className="h-6 w-6 mr-2 text-primary" />
            Stock Opname
          </h1>
          <p className="text-muted-foreground mt-1">
            Verify and adjust physical inventory against system records
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsHelpDialogOpen(true)}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
          <Button onClick={() => setIsScannerOpen(true)}>
            <BarcodeIcon className="h-4 w-4 mr-2" />
            Scan Product
          </Button>
        </div>
      </div>

      {alert && (
        <Alert 
          variant={alert.type === 'error' ? 'destructive' : alert.type} 
          className="mb-6"
        >
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              With Differences
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.itemsWithDifference}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Excess
            </CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalExcess}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Shortage
            </CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalShortage}</div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Opname Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Opname Items</CardTitle>
          <CardDescription>
            Compare system quantities with actual physical counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {opnameItems.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">System Qty</TableHead>
                    <TableHead className="text-center">Actual Qty</TableHead>
                    <TableHead className="text-center">Difference</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opnameItems.map((item) => {
                    const difference = item.actual_quantity - item.system_quantity;
                    
                    return (
                      <TableRow key={item.product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                              {item.product.image_path ? (
                                <img 
                                  src={`/storage/${item.product.image_path}`} 
                                  alt={item.product.name}
                                  className="h-full w-full object-cover rounded-md"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-xs text-muted-foreground">
                                SKU: {item.product.sku}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.product.category.name}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {item.system_quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleQuantityChange(
                                item.product.id, 
                                Math.max(0, item.actual_quantity - 1)
                              )}
                              disabled={item.actual_quantity <= 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={item.actual_quantity}
                              onChange={(e) => handleQuantityChange(
                                item.product.id,
                                parseInt(e.target.value) || 0
                              )}
                              className="w-16 mx-2 text-center"
                            />
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleQuantityChange(
                                item.product.id, 
                                item.actual_quantity + 1
                              )}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {difference === 0 ? (
                            <Badge variant="outline">0</Badge>
                          ) : difference > 0 ? (
                            <Badge variant="success" className="justify-center w-16">+{difference}</Badge>
                          ) : (
                            <Badge variant="destructive" className="justify-center w-16">{difference}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.notes}
                            onChange={(e) => handleNotesChange(item.product.id, e.target.value)}
                            placeholder="Enter notes here..."
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.product.id)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No products added yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Scan product barcodes to add them to the stock opname list
              </p>
              <Button onClick={() => setIsScannerOpen(true)}>
                <BarcodeIcon className="mr-2 h-4 w-4" />
                Scan Product
              </Button>
            </div>
          )}
        </CardContent>
        {opnameItems.length > 0 && (
          <CardFooter className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setOpnameItems([])}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit Stock Opname
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner 
          onDetected={handleBarcodeScan} 
          onClose={() => setIsScannerOpen(false)}
          scanPurpose="stock_opname"
        />
      )}

      {/* Help Dialog */}
      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to Perform Stock Opname</DialogTitle>
            <DialogDescription>
              Stock opname is an inventory auditing process that compares physical counts with system records.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <span className="flex items-center justify-center bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm mr-2">1</span>
                Scan Products
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                Click "Scan Product" button and use your camera to scan barcode on product packaging.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <span className="flex items-center justify-center bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm mr-2">2</span>
                Update Actual Quantities
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                Enter the actual physical count for each product. Use the plus/minus buttons or type in the value.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <span className="flex items-center justify-center bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm mr-2">3</span>
                Add Notes (Optional)
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                For any discrepancies, add notes to explain the difference (e.g., "Damaged goods", "Found in storage").
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <span className="flex items-center justify-center bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm mr-2">4</span>
                Submit Stock Opname
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                Review all entries and click "Submit Stock Opname" to update system inventory records.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsHelpDialogOpen(false)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default StockOpnameIndex;