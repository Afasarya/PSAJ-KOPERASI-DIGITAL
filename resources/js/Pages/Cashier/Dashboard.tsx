import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CashierLayout from '@/Layouts/CashierLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  Package, 
  ShoppingCart, 
  TrendingUp 
} from 'lucide-react';

interface DashboardProps {
  todaySales: number;
  todayTransactionCount: number;
  recommendedProducts: any[];
}

const CashierDashboard: React.FC<DashboardProps> = ({
  todaySales,
  todayTransactionCount,
  recommendedProducts,
}) => {
  return (
    <CashierLayout title="Dashboard Kasir">
      <Head title="Dashboard - Kasir" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Penjualan Hari Ini
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todaySales)}</div>
            <p className="text-xs text-muted-foreground">
              Dari {todayTransactionCount} transaksi
            </p>
          </CardContent>
        </Card>

        {/* Quick Access for POS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Akses Cepat
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm text-muted-foreground">
              Akses cepat ke halaman kasir (POS) untuk memulai transaksi baru
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={route('cashier.pos.index')}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buka Kasir
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Riwayat Transaksi
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm text-muted-foreground">
              Lihat riwayat transaksi yang telah dilakukan
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={route('cashier.transactions.index')}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Lihat Riwayat
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recommended Products */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Produk yang Direkomendasikan Hari Ini</CardTitle>
          <CardDescription>
            Produk-produk berikut direkomendasikan berdasarkan pola pembelian dan analisis AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative bg-muted">
                  {product.image_path ? (
                    <img
                      src={`/storage/${product.image_path}`}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="success">Rekomendasi</Badge>
                  </div>
                </div>
                <CardHeader className="p-3">
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {product.category?.name}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-3 pt-0 flex justify-between">
                  <div className="font-semibold">{formatCurrency(product.price_sell)}</div>
                  <div className="text-xs text-muted-foreground">
                    Stok: {product.inventory?.quantity || 0}
                  </div>
                </CardFooter>
              </Card>
            ))}

            {recommendedProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Tidak ada rekomendasi produk</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Rekomendasi produk akan muncul berdasarkan pola pembelian
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </CashierLayout>
  );
};

export default CashierDashboard;