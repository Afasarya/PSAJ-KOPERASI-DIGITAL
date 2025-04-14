import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Badge } from '@/Components/ui/badge';
import { 
  AlertTriangle, 
  ArrowDown, 
  ArrowUp, 
  Clock, 
  DollarSign, 
  Package, 
  ShoppingBag 
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

interface DashboardProps {
  todayIncome: number;
  weeklyIncome: number;
  monthlyIncome: number;
  bestSellingProducts: any[];
  lowStockProducts: any[];
  stockPredictions: any[];
  transactionAnomalies: any[];
  monthlySalesData: any[];
}

const Dashboard: React.FC<DashboardProps> = ({
  todayIncome,
  weeklyIncome,
  monthlyIncome,
  bestSellingProducts,
  lowStockProducts,
  stockPredictions,
  transactionAnomalies,
  monthlySalesData,
}) => {
  // Calculate change percentages (in a real app this would come from the backend)
  const todayChange = 5.2; // Example percentage
  const weeklyChange = -2.3; // Example percentage
  const monthlyChange = 12.8; // Example percentage

  return (
    <AdminLayout title="Dashboard">
      <Head title="Dashboard - Admin" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendapatan Hari Ini
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayIncome)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {todayChange > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{todayChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-4 w-4 text-destructive" />
                  <span className="text-destructive">{Math.abs(todayChange)}%</span>
                </>
              )}
              <span className="ml-1">dari kemarin</span>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendapatan Minggu Ini
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(weeklyIncome)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {weeklyChange > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{weeklyChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-4 w-4 text-destructive" />
                  <span className="text-destructive">{Math.abs(weeklyChange)}%</span>
                </>
              )}
              <span className="ml-1">dari minggu lalu</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendapatan Bulan Ini
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {monthlyChange > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{monthlyChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-4 w-4 text-destructive" />
                  <span className="text-destructive">{Math.abs(monthlyChange)}%</span>
                </>
              )}
              <span className="ml-1">dari bulan lalu</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Pendapatan Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlySalesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('id-ID', {
                      notation: 'compact',
                      compactDisplay: 'short',
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Pendapatan']}
                  labelFormatter={(label) => `Bulan: ${label}`}
                />
                <Legend />
                <Bar dataKey="sales" name="Pendapatan" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* Best Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Total Terjual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestSellingProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category?.name}</TableCell>
                    <TableCell className="text-right">{product.total_sold}</TableCell>
                  </TableRow>
                ))}
                {bestSellingProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      Tidak ada data produk terlaris
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle>Stok Menipis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category?.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive">{product.inventory?.quantity}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {lowStockProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      Tidak ada produk dengan stok menipis
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* Stock Predictions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Prediksi Kehabisan Stok</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Tanggal Prediksi</TableHead>
                  <TableHead className="text-right">Sisa Hari</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockPredictions.map((prediction) => {
                  const daysLeft = Math.ceil(
                    (new Date(prediction.predicted_date).getTime() - new Date().getTime()) / 
                    (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <TableRow key={prediction.id}>
                      <TableCell className="font-medium">{prediction.product?.name}</TableCell>
                      <TableCell>{formatDate(prediction.predicted_date)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={daysLeft <= 3 ? "destructive" : daysLeft <= 7 ? "warning" : "success"}>
                          {daysLeft} hari
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {stockPredictions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      Tidak ada prediksi kehabisan stok
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Transaction Anomalies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Anomali Transaksi</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Tipe Anomali</TableHead>
                  <TableHead className="text-right">Skor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionAnomalies.map((anomaly) => (
                  <TableRow key={anomaly.id}>
                    <TableCell className="font-medium">{anomaly.transaction?.invoice_number}</TableCell>
                    <TableCell>{anomaly.anomaly_type}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive">
                        {(anomaly.confidence_score * 100).toFixed(0)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {transactionAnomalies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      Tidak ada anomali transaksi terdeteksi
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;