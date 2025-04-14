import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/Components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/Components/ui/table';
import { 
  ArrowLeft, 
  Edit, 
  Folder, 
  Package, 
  ShoppingBasket
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Pagination } from '@/Components/Pagination';
import { formatCurrency } from '@/lib/utils';

interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  price_buy: number;
  price_sell: number;
  image_path: string | null;
  is_active: boolean;
  inventory: {
    quantity: number;
  };
}

interface CategoryShowProps {
  category: Category;
  products: {
    data: Product[];
    links: any[];
    from: number;
    to: number;
    total: number;
  };
}

const CategoryShow: React.FC<CategoryShowProps> = ({ category, products }) => {
  return (
    <AdminLayout title={`Detail Kategori - ${category.name}`}>
      <Head title={`Detail Kategori - ${category.name}`} />

      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={route('admin.categories.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Kategori
          </Link>
        </Button>
      </div>

      {/* Category Details Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <Folder className="h-6 w-6 text-primary mr-2" />
              <div>
                <CardTitle className="text-2xl">{category.name}</CardTitle>
                <CardDescription>
                  Kategori dibuat pada {new Date(category.created_at).toLocaleDateString('id-ID')}
                </CardDescription>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href={route('admin.categories.edit', category.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Kategori
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Deskripsi</h3>
              <p className="text-base">
                {category.description || 'Tidak ada deskripsi untuk kategori ini.'}
              </p>
            </div>
            <div>
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Statistik Kategori</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Produk:</span>
                    <Badge variant="secondary">{products.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Terakhir Diperbarui:</span>
                    <span className="text-sm">{new Date(category.updated_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products in Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBasket className="h-5 w-5 mr-2" />
            Produk dalam Kategori
          </CardTitle>
          <CardDescription>
            Daftar semua produk yang termasuk dalam kategori {category.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Harga Beli</TableHead>
                    <TableHead>Harga Jual</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.data.map((product) => (
                    <TableRow key={product.id}>
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
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{formatCurrency(product.price_buy)}</TableCell>
                      <TableCell>{formatCurrency(product.price_sell)}</TableCell>
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
                        <Button asChild size="sm" variant="outline">
                          <Link href={route('admin.products.show', product.id)}>
                            Detail
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {products.from} hingga {products.to} dari {products.total} produk
                </div>
                <Pagination links={products.links} />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Tidak ada produk</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Kategori ini belum memiliki produk.
              </p>
              <Button asChild>
                <Link href={route('admin.products.create')}>
                  Tambah Produk Baru
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default CategoryShow;