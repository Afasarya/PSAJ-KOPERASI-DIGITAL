import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  BarcodeIcon, 
  Package 
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Pagination } from '@/Components/Pagination';

interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  image_path: string | null;
  is_active: boolean;
  category: {
    name: string;
  };
}

interface InventoryHistory {
  id: number;
  quantity_change: number;
  type: 'in' | 'out';
  notes: string | null;
  scan_method: 'manual' | 'barcode';
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

interface HistoryProps {
  product: Product;
  histories: {
    data: InventoryHistory[];
    links: any[];
    from: number;
    to: number;
    total: number;
  };
}

const InventoryHistory: React.FC<HistoryProps> = ({ product, histories }) => {
  return (
    <AdminLayout title={`Riwayat Stok - ${product.name}`}>
      <Head title={`Riwayat Stok - ${product.name}`} />

      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={route('admin.inventory.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Inventaris
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center">
            {product.image_path ? (
              <img 
                src={`/storage/${product.image_path}`} 
                alt={product.name}
                className="h-full w-full object-cover rounded-md"
              />
            ) : (
              <Package className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <div className="text-sm text-muted-foreground mt-1">
              <span>SKU: {product.sku}</span>
              {product.barcode && (
                <span className="ml-4">Barcode: {product.barcode}</span>
              )}
            </div>
            <div className="text-sm mt-1">Kategori: {product.category.name}</div>
            <div className="mt-2">
              <Badge variant={product.is_active ? 'success' : 'warning'}>
                {product.is_active ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Riwayat Perubahan Stok</h2>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead>Perubahan</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {histories.data.length > 0 ? (
                histories.data.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell>
                      <div>{formatDate(history.created_at)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(history.created_at).split(' ').slice(3).join(' ')}
                      </div>
                    </TableCell>
                    <TableCell>{history.user.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {history.type === 'in' ? (
                          <Badge variant="success" className="flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +{history.quantity_change}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="flex items-center">
                            <ArrowDownLeft className="h-3 w-3 mr-1" />
                            {history.quantity_change}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {history.scan_method === 'barcode' ? (
                          <div className="flex items-center">
                            <BarcodeIcon className="h-3 w-3 mr-1" />
                            Barcode
                          </div>
                        ) : (
                          'Manual'
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {history.notes || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">Tidak ada riwayat perubahan stok</h3>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {histories.data.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {histories.from} hingga {histories.to} dari {histories.total} riwayat
              </div>
              <Pagination links={histories.links} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default InventoryHistory;