// resources/js/Pages/Admin/Products/Index.tsx
import React, { useState } from 'react';
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
  BarcodeIcon, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Eye, 
  Loader2, 
  Package, 
  PackagePlus, 
  Search, 
  Trash2 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Pagination } from '@/Components/Pagination';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/Components/ui/alert-dialog';
import BarcodeScanner from '@/Components/BarcodeScanner';
import { Alert, AlertDescription } from '@/Components/ui/alert';
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
  description: string | null;
  price_buy: number;
  price_sell: number;
  category_id: number;
  image_path: string | null;
  is_active: boolean;
  category: Category;
  inventory: {
    id: number;
    quantity: number;
  };
}

interface ProductsIndexProps {
  products: {
    data: Product[];
    links: any[];
    from: number;
    to: number;
    total: number;
  };
  categories: Category[];
  filters: {
    search?: string;
    category_id?: string;
    is_active?: string;
    sort_by?: string;
    sort_direction?: string;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const ProductsIndex: React.FC<ProductsIndexProps> = ({ products, categories, filters, flash }) => {
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'destructive' | 'warning';
    message: string;
  } | null>(flash?.success ? { type: 'success', message: flash.success } : 
           flash?.error ? { type: 'destructive', message: flash.error } : null);

  const [searchParams, setSearchParams] = useState({
    search: filters.search || '',
    category_id: filters.category_id || '',
    is_active: filters.is_active || '',
    sort_by: filters.sort_by || 'name',
    sort_direction: filters.sort_direction || 'asc',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    
    // Update query parameters
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
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
      is_active: '',
      sort_by: 'name',
      sort_direction: 'asc',
    });
    
    window.location.href = route('admin.products.index');
  };

  const handleBarcodeScan = async (barcode: string) => {
    setIsScannerOpen(false);
    setIsSearching(true);
    
    try {
      const response = await axios.post(route('admin.products.search-barcode'), {
        barcode
      });
      
      if (response.data.found) {
        // Redirect to product details
        window.location.href = route('admin.products.show', response.data.product.id);
      } else {
        setAlert({
          type: 'warning',
          message: `Produk dengan barcode ${barcode} tidak ditemukan.`,
        });
      }
    } catch (error) {
      console.error('Error searching barcode:', error);
      setAlert({
        type: 'destructive',
        message: 'Gagal mencari produk dengan barcode tersebut.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    axios.delete(route('admin.products.destroy', productId))
      .then(() => {
        window.location.href = route('admin.products.index');
      })
      .catch((error) => {
        console.error('Error deleting product:', error);
        setAlert({
          type: 'destructive',
          message: 'Gagal menghapus produk. ' + (error.response?.data?.message || ''),
        });
      });
  };

  return (
    <AdminLayout title="Manajemen Produk">
      <Head title="Manajemen Produk" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Produk</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
            <BarcodeIcon className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
          <Button asChild>
            <Link href={route('admin.products.create')}>
              <PackagePlus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Link>
          </Button>
        </div>
      </div>

      {alert && (
        <Alert 
          variant={alert.type} 
          className="mb-4"
        >
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="bg-card rounded-lg shadow-sm border mb-6">
        <div className="p-4">
          <form onSubmit={handleSearch}>
            <div className="grid gap-4 md:grid-cols-4">
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
                  value={searchParams.category_id}
                  onValueChange={(value) => setSearchParams({ ...searchParams, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* PERBAIKAN: Ubah value dari string kosong menjadi "all" */}
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select
                  value={searchParams.is_active}
                  onValueChange={(value) => setSearchParams({ ...searchParams, is_active: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* PERBAIKAN: Ubah value dari string kosong menjadi "all" */}
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="1">Aktif</SelectItem>
                    <SelectItem value="0">Nonaktif</SelectItem>
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
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('price_sell')}
                >
                  Harga Jual {searchParams.sort_by === 'price_sell' && (
                    searchParams.sort_direction === 'asc' ? '↑' : '↓'
                  )}
                </TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Status</TableHead>
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
                        <div className="font-medium">{product.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>SKU: {product.sku}</div>
                      {product.barcode && (
                        <div className="text-xs text-muted-foreground">Barcode: {product.barcode}</div>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(product.price_sell)}</TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.inventory?.quantity <= 10 ? 'destructive' : 'secondary'}>
                        {product.inventory?.quantity || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'success' : 'warning'}>
                        {product.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          asChild 
                          variant="ghost" 
                          size="icon"
                        >
                          <Link href={route('admin.products.show', product.id)}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          asChild 
                          variant="ghost" 
                          size="icon"
                        >
                          <Link href={route('admin.products.edit', product.id)}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setDeleteProductId(product.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus produk "{product.name}"? 
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">Tidak ada produk ditemukan</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Coba ubah filter pencarian atau tambahkan produk baru
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
          scanPurpose="product_info"
        />
      )}

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

export default ProductsIndex;