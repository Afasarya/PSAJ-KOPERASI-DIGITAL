import React, { useState, FormEvent } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/Components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/Components/ui/badge';
import { 
  ArrowDownUp,
  BarcodeIcon, 
  Check,
  ClipboardList, 
  Loader2, 
  Package, 
  RefreshCw, 
  Search, 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Pagination } from '@/Components/Pagination';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/Components/ui/alert-dialog';
import BarcodeScanner from '@/Components/BarcodeScanner';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/text-area';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
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
    predicted_stock_out_date: string | null;
  };
  category: Category;
}

interface InventoryIndexProps {
  products: {
    data: Product[];
    links: any[];
    from: number;
    to: number;
    total: number;
  };
  filters: {
    search?: string;
    category_id?: string;
    low_stock?: string;
    sort_by?: string;
    sort_direction?: string;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const InventoryIndex: React.FC<InventoryIndexProps> = ({ products, filters, flash }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(flash?.success ? { type: 'success', message: flash.success } : 
           flash?.error ? { type: 'error', message: flash.error } : null);

  const [searchParams, setSearchParams] = useState({
    search: filters.search || '',
    category_id: filters.category_id || '',
    low_stock: filters.low_stock || 'all', // Mengubah '' menjadi 'all'
    sort_by: filters.sort_by || 'name',
    sort_direction: filters.sort_direction || 'asc',
  });

  const [updateStockDialog, setUpdateStockDialog] = useState<{
    isOpen: boolean;
    product: Product | null;
    quantity: string;
    notes: string;
    isProcessing: boolean;
    isAdd: boolean;
  }>({
    isOpen: false,
    product: null,
    quantity: '1',
    notes: '',
    isProcessing: false,
    isAdd: true,
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    
    // Update query parameters
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && value !== 'all') { // Tidak menyertakan 'all' dalam query params
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    
    window.location.href = url.toString();
  };

  const handleSort = (column: string) => {
    let direction = 'asc';
    if (searchParams.sort_by === column) {
      direction = searchParams.sort_direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSearchParams({
      ...searchParams,
      sort_by: column,
      sort_direction: direction,
    });
    
    const url = new URL(window.location.href);
    url.searchParams.set('sort_by', column);
    url.searchParams.set('sort_direction', direction);
    window.location.href = url.toString();
  };

  const resetFilters = () => {
    setSearchParams({
      search: '',
      category_id: '',
      low_stock: 'all', // Mengubah '' menjadi 'all'
      sort_by: 'name',
      sort_direction: 'asc',
    });
    
    window.location.href = route('admin.inventory.index');
  };

  const handleBarcodeScan = async (barcode: string) => {
    setIsScannerOpen(false);
    setIsSearching(true);
    
    try {
      const response = await axios.post(route('barcode.scan'), {
        barcode,
        scan_purpose: 'stock_opname',
      });
      
      if (response.data.found) {
        const product = response.data.product;
        openUpdateStockDialog(product, true);
      } else {
        setAlert({
          type: 'warning',
          message: `Produk dengan barcode ${barcode} tidak ditemukan.`,
        });
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      setAlert({
        type: 'error',
        message: 'Gagal memproses barcode. Silakan coba lagi.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const openUpdateStockDialog = (product: Product, isAdd: boolean) => {
    setUpdateStockDialog({
      isOpen: true,
      product,
      quantity: '1',
      notes: '',
      isProcessing: false,
      isAdd,
    });
  };

  const closeUpdateStockDialog = () => {
    setUpdateStockDialog({
      ...updateStockDialog,
      isOpen: false,
    });
  };

  const handleUpdateStock = async () => {
    if (!updateStockDialog.product) return;
    
    setUpdateStockDialog({
      ...updateStockDialog,
      isProcessing: true,
    });
    
    try {
      const quantityChange = updateStockDialog.isAdd 
        ? Math.abs(parseInt(updateStockDialog.quantity))
        : -Math.abs(parseInt(updateStockDialog.quantity));
        
      await axios.post(route('admin.inventory.update-stock', updateStockDialog.product.id), {
        quantity_change: quantityChange,
        notes: updateStockDialog.notes,
        scan_method: 'manual',
      });
      
      // Success
      setAlert({
        type: 'success',
        message: `Stok ${updateStockDialog.product.name} berhasil diperbarui.`,
      });
      
      // Refresh the page
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating stock:', error);
      setAlert({
        type: 'error',
        message: 'Gagal memperbarui stok. ' + 
          ((error as any).response?.data?.message || 'Silakan coba lagi.'),
      });
      
      closeUpdateStockDialog();
    }
  };

  return (
    <AdminLayout title="Manajemen Inventaris">
      <Head title="Manajemen Inventaris" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Inventaris</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
            <BarcodeIcon className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
          <Button asChild>
            <Link href={route('admin.stock-opname.index')}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Stock Opname
            </Link>
          </Button>
        </div>
      </div>

      {alert && (
        <Alert 
          variant={alert.type === 'error' ? 'destructive' : alert.type} 
          className="mb-4"
        >
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="bg-card rounded-lg shadow-sm border mb-6">
        <div className="p-4">
          <form onSubmit={handleSearch}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari produk..."
                    className="pl-8"
                    value={searchParams.search}
                    onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Select
                  value={searchParams.low_stock}
                  onValueChange={(value) => setSearchParams({ ...searchParams, low_stock: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status Stok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Stok</SelectItem>
                    <SelectItem value="1">Stok Menipis (&lt;10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button type="button" variant="outline" onClick={resetFilters}>
                Reset Filter
              </Button>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer w-12"
                  onClick={() => handleSort('id')}
                >
                  ID {searchParams.sort_by === 'id' && (
                    searchParams.sort_direction === 'asc' ? '↑' : '↓'
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Nama Produk {searchParams.sort_by === 'name' && (
                    searchParams.sort_direction === 'asc' ? '↑' : '↓'
                  )}
                </TableHead>
                <TableHead>SKU / Barcode</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('inventory.quantity')}
                >
                  Stok {searchParams.sort_by === 'inventory.quantity' && (
                    searchParams.sort_direction === 'asc' ? '↑' : '↓'
                  )}
                </TableHead>
                <TableHead>Prediksi Habis</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.data.length > 0 ? (
                products.data.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                          {product.image_path ? (
                            <img 
                              src={`/storage/${product.image_path}`} 
                              alt={product.name}
                              className="h-full w-full object-cover rounded-md"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(product.price_sell)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>SKU: {product.sku}</div>
                      {product.barcode && (
                        <div className="text-xs text-muted-foreground">Barcode: {product.barcode}</div>
                      )}
                    </TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.inventory?.quantity <= 10 ? 'destructive' : 'secondary'}>
                        {product.inventory?.quantity || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.inventory?.predicted_stock_out_date ? (
                        <div className="text-sm">
                          {new Date(product.inventory.predicted_stock_out_date).toLocaleDateString('id-ID')}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openUpdateStockDialog(product, true)}
                        >
                          <ArrowDownUp className="h-4 w-4 mr-1" />
                          Update Stok
                        </Button>
                        <Button 
                          asChild
                          size="sm"
                        >
                          <Link href={route('admin.inventory.history', product.id)}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Riwayat
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">Tidak ada produk ditemukan</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Coba ubah filter pencarian
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {products.data.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {products.from} hingga {products.to} dari {products.total} produk
              </div>
              <Pagination links={products.links} />
            </div>
          </div>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner 
          onDetected={handleBarcodeScan} 
          onClose={() => setIsScannerOpen(false)}
          scanPurpose="stock_opname"
        />
      )}

      {/* Update Stock Dialog */}
      <Dialog open={updateStockDialog.isOpen} onOpenChange={closeUpdateStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {updateStockDialog.isAdd ? 'Tambah Stok' : 'Kurangi Stok'} Produk
            </DialogTitle>
            <DialogDescription>
              {updateStockDialog.product?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <Label htmlFor="current-stock">Stok Saat Ini</Label>
                <div className="font-medium mt-1">
                  {updateStockDialog.product?.inventory?.quantity || 0}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant={updateStockDialog.isAdd ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUpdateStockDialog({
                      ...updateStockDialog,
                      isAdd: true,
                    })}
                  >
                    {updateStockDialog.isAdd && <Check className="h-4 w-4 mr-1" />}
                    Tambah
                  </Button>
                  <Button
                    type="button"
                    variant={!updateStockDialog.isAdd ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUpdateStockDialog({
                      ...updateStockDialog,
                      isAdd: false,
                    })}
                  >
                    {!updateStockDialog.isAdd && <Check className="h-4 w-4 mr-1" />}
                    Kurangi
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="quantity">Jumlah {updateStockDialog.isAdd ? 'Tambah' : 'Kurangi'}</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={updateStockDialog.quantity}
                onChange={(e) => setUpdateStockDialog({
                  ...updateStockDialog,
                  quantity: e.target.value,
                })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={updateStockDialog.notes}
                onChange={(e) => setUpdateStockDialog({
                  ...updateStockDialog,
                  notes: e.target.value,
                })}
                placeholder="Tambahkan catatan mengenai perubahan stok"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Hasil Akhir</Label>
              <div className="mt-1 font-medium text-lg">
                {updateStockDialog.product && (
                  updateStockDialog.isAdd 
                    ? (updateStockDialog.product.inventory?.quantity || 0) + parseInt(updateStockDialog.quantity || '0')
                    : Math.max(0, (updateStockDialog.product.inventory?.quantity || 0) - parseInt(updateStockDialog.quantity || '0'))
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeUpdateStockDialog}>
              Batal
            </Button>
            <Button 
              onClick={handleUpdateStock}
              disabled={updateStockDialog.isProcessing || !updateStockDialog.quantity || parseInt(updateStockDialog.quantity) <= 0}
            >
              {updateStockDialog.isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>Update Stok</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading overlay */}
      {isSearching && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
            <p className="text-foreground">Mencari produk...</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default InventoryIndex;