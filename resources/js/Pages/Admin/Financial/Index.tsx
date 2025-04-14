import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowDownToLine, 
  BarChart4, 
  Calendar, 
  Download, 
  FileText, 
  PieChart as PieChartIcon,
  TrendingUp,
  Info
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
import { DatePicker } from '@/Components/DatePicker';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/Components/ui/tabs';

interface FinancialReportProps {
  salesData: Array<{
    date: string;
    sales: number;
  }>;
  profitData: {
    total_sales: number;
    total_cost: number;
    profit: number;
    profit_margin: number;
  };
  salesByCategory: Array<{
    name: string;
    total: number;
  }>;
  topSellingProducts: Array<{
    id: number;
    name: string;
    quantity_sold: number;
    total_sales: number;
  }>;
  startDate: string;
  endDate: string;
}

// Generate colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

const FinancialReport: React.FC<FinancialReportProps> = ({
  salesData,
  profitData,
  salesByCategory,
  topSellingProducts,
  startDate,
  endDate
}) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setDateRange({ ...dateRange, startDate: date });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setDateRange({ ...dateRange, endDate: date });
    }
  };

  const applyDateFilter = () => {
    window.location.href = route('admin.financial-reports.index', {
      start_date: dateRange.startDate.toISOString().split('T')[0],
      end_date: dateRange.endDate.toISOString().split('T')[0],
    });
  };

  const handleExportPdf = () => {
    window.open(route('admin.financial-reports.export-pdf', {
      start_date: dateRange.startDate.toISOString().split('T')[0],
      end_date: dateRange.endDate.toISOString().split('T')[0],
    }), '_blank');
  };

  const handleExportExcel = () => {
    window.open(route('admin.financial-reports.export-excel', {
      start_date: dateRange.startDate.toISOString().split('T')[0],
      end_date: dateRange.endDate.toISOString().split('T')[0],
    }), '_blank');
  };

  return (
    <AdminLayout title="Laporan Keuangan">
      <Head title="Laporan Keuangan" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
          <p className="text-muted-foreground mt-1">
            Periode: {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row mt-4 md:mt-0 gap-3">
          <Button variant="outline" onClick={handleExportPdf}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Filter Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="text-sm font-medium mb-1">Tanggal Mulai</div>
              <DatePicker 
                date={dateRange.startDate} 
                onSelect={handleStartDateChange} 
              />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium mb-1">Tanggal Akhir</div>
              <DatePicker 
                date={dateRange.endDate} 
                onSelect={handleEndDateChange} 
              />
            </div>
            <div className="flex items-end">
              <Button onClick={applyDateFilter}>
                Terapkan Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendapatan
            </CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profitData.total_sales)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Biaya
            </CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profitData.total_cost)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Keuntungan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(profitData.profit)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Margin Keuntungan
            </CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitData.profit_margin}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="sales" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">Penjualan Harian</TabsTrigger>
          <TabsTrigger value="category">Penjualan per Kategori</TabsTrigger>
          <TabsTrigger value="products">Produk Terlaris</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Grafik Penjualan Harian</CardTitle>
              <CardDescription>
                Tampilan penjualan harian selama periode {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis 
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
                      formatter={(value) => [formatCurrency(value as number), 'Penjualan']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      name="Penjualan" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Penjualan per Kategori</CardTitle>
              <CardDescription>
                Distribusi penjualan berdasarkan kategori produk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value as number), 'Penjualan']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="text-right">Persentase</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesByCategory.map((category, index) => {
                        const totalSales = salesByCategory.reduce((sum, cat) => sum + parseFloat(cat.total.toString()), 0);
                        const percentage = (parseFloat(category.total.toString()) / totalSales) * 100;
                        
                        return (
                          <TableRow key={category.name}>
                            <TableCell>
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></div>
                                {category.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(category.total)}</TableCell>
                            <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris</CardTitle>
              <CardDescription>
                Produk dengan penjualan tertinggi selama periode laporan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topSellingProducts}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number"
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={150}
                        tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 18)}...` : value}
                      />
                      <Tooltip 
                        formatter={(value) => [value.toLocaleString(), 'Jumlah Terjual']}
                      />
                      <Legend />
                      <Bar dataKey="quantity_sold" name="Jumlah Terjual" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-right">Terjual</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topSellingProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-right">{product.quantity_sold}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.total_sales)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Ringkasan Keuangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Periode</div>
                <div className="font-medium">
                  {new Date(startDate).toLocaleDateString('id-ID')} s/d {new Date(endDate).toLocaleDateString('id-ID')}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Total Pendapatan</div>
                <div className="font-medium">{formatCurrency(profitData.total_sales)}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Total Biaya</div>
                <div className="font-medium">{formatCurrency(profitData.total_cost)}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Keuntungan</div>
                <div className="font-medium text-green-600">{formatCurrency(profitData.profit)}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Margin Keuntungan</div>
                <div className="font-medium">{profitData.profit_margin}%</div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleExportPdf}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={handleExportExcel}>
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default FinancialReport;