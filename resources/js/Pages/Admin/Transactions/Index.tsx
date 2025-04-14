// resources/js/Pages/Admin/Transactions/Index.tsx
import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  CalendarIcon,
  CreditCard,
  Download,
  Eye,
  FileText,
  FilterIcon,
  Printer,
  Search,
  User as UserIcon
} from 'lucide-react';
import { Pagination } from '@/Components/Pagination';
import { formatCurrency } from '@/lib/utils';

interface User {
  id: number;
  name: string;
}

interface PaymentMethod {
  id: number;
  name: string;
}

interface Transaction {
  id: number;
  invoice_number: string;
  customer_name: string | null;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  payment_method: PaymentMethod;
  user: User;
  items_count: number;
}

interface TransactionIndexProps {
  transactions: {
    data: Transaction[];
    links: any[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
  };
  filters: {
    search?: string;
    date_start?: string;
    date_end?: string;
    payment_status?: string;
    payment_method_id?: string;
    user_id?: string;
  };
  payment_methods: PaymentMethod[];
  flash?: {
    success?: string;
    error?: string;
  };
}

const TransactionIndex: React.FC<TransactionIndexProps> = ({ transactions, filters, payment_methods, flash }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateStart, setDateStart] = useState(filters.date_start || '');
  const [dateEnd, setDateEnd] = useState(filters.date_end || '');
  const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || 'all');
  const [paymentMethodId, setPaymentMethodId] = useState(filters.payment_method_id || 'all');
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(flash?.success ? { type: 'success', message: flash.success } : 
           flash?.error ? { type: 'error', message: flash.error } : null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const params: Record<string, string> = {};
    
    if (searchTerm) params.search = searchTerm;
    if (dateStart) params.date_start = dateStart;
    if (dateEnd) params.date_end = dateEnd;
    if (paymentStatus && paymentStatus !== 'all') params.payment_status = paymentStatus;
    if (paymentMethodId && paymentMethodId !== 'all') params.payment_method_id = paymentMethodId;
    
    window.location.href = route('admin.transactions.index', params);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateStart('');
    setDateEnd('');
    setPaymentStatus('all');
    setPaymentMethodId('all');
    window.location.href = route('admin.transactions.index');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout title="Manajemen Transaksi">
      <Head title="Manajemen Transaksi" />

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Daftar Transaksi</CardTitle>
                <CardDescription>
                  Kelola dan lihat semua transaksi dalam sistem
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                <FilterIcon className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari nomor faktur atau nama pelanggan..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit">Cari</Button>
              </form>

              {isFilterOpen && (
                <Card className="p-4 border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tanggal Mulai</label>
                      <Input 
                        type="date" 
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tanggal Akhir</label>
                      <Input 
                        type="date" 
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status Pembayaran</label>
                      <Select
                        value={paymentStatus}
                        onValueChange={setPaymentStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="paid">Dibayar</SelectItem>
                          <SelectItem value="pending">Tertunda</SelectItem>
                          <SelectItem value="failed">Gagal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Metode Pembayaran</label>
                      <Select
                        value={paymentMethodId}
                        onValueChange={setPaymentMethodId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Semua Metode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Metode</SelectItem>
                          {payment_methods.map((method) => (
                            <SelectItem key={method.id} value={method.id.toString()}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={resetFilters}>Reset</Button>
                    <Button onClick={applyFilters}>Terapkan Filter</Button>
                  </div>
                </Card>
              )}
            </div>

            {alert && (
              <Alert 
                variant={alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'warning' : 'default'} 
                className="my-4"
              >
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Faktur</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Metode Pembayaran</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                        <FileText className="mx-auto h-8 w-8 mb-2" />
                        <p>Tidak ada transaksi yang ditemukan</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.data.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.invoice_number}</TableCell>
                        <TableCell>{formatDate(transaction.created_at)}</TableCell>
                        <TableCell>{transaction.customer_name || <span className="text-muted-foreground italic">Tanpa Nama</span>}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <UserIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{transaction.user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.payment_method.name}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(transaction.payment_status)}>
                            {transaction.payment_status === 'paid' && 'Dibayar'}
                            {transaction.payment_status === 'pending' && 'Tertunda'}
                            {transaction.payment_status === 'failed' && 'Gagal'}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.items_count}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(transaction.total_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link href={route('admin.transactions.show', transaction.id)}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {transactions.data.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {transactions.from} hingga {transactions.to} dari {transactions.total} transaksi
                  </div>
                  <Pagination links={transactions.links} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default TransactionIndex;