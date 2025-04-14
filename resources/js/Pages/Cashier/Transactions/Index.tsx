// resources/js/Pages/Cashier/Transactions/Index.tsx
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import CashierLayout from '@/Layouts/CashierLayout';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
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
import { CalendarIcon, CreditCard, Eye, FileText, FilterIcon, Printer, Search } from 'lucide-react';
import TransactionDetailModal from './TransactionDetailModal';

// Import simplified components
import {
  Separator,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/Components/SimpleComponents';

interface Transaction {
  id: number;
  invoice_number: string;
  customer_name: string | null;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  payment_method: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
  };
  items_count: number;
}

interface TransactionIndexProps {
  transactions: {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  filters: {
    search: string;
    date_start: string | null;
    date_end: string | null;
    payment_status: string | null;
    payment_method_id: number | null;
  };
  payment_methods: {
    id: number;
    name: string;
  }[];
}

const TransactionIndex: React.FC<TransactionIndexProps> = ({ transactions, filters, payment_methods }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: filters.date_start ? new Date(filters.date_start) : undefined,
    to: filters.date_end ? new Date(filters.date_end) : undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = route('cashier.transactions.index', { search: searchTerm });
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

  const applyFilters = () => {
    const params = {
      search: searchTerm,
      date_start: filters.date_start,
      date_end: filters.date_end,
      payment_status: filters.payment_status,
      payment_method_id: filters.payment_method_id,
    };

    // Remove null/undefined values
    Object.keys(params).forEach(key => {
      if (params[key as keyof typeof params] === null || params[key as keyof typeof params] === undefined) {
        delete params[key as keyof typeof params];
      }
    });

    window.location.href = route('cashier.transactions.index', params);
  };

  const resetFilters = () => {
    window.location.href = route('cashier.transactions.index');
  };

  const viewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  // Simple date picker component
  const handleDateChange = (type: 'start' | 'end', dateStr: string) => {
    if (type === 'start') {
      window.location.href = route('cashier.transactions.index', {
        ...filters,
        date_start: dateStr || null
      });
    } else {
      window.location.href = route('cashier.transactions.index', {
        ...filters,
        date_end: dateStr || null
      });
    }
  };

  return (
    <CashierLayout title="Riwayat Transaksi">
      <Head title="Riwayat Transaksi" />

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Riwayat Transaksi</CardTitle>
                <CardDescription>
                  Lihat dan kelola riwayat transaksi penjualan
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
                        value={filters.date_start || ''} 
                        onChange={(e) => handleDateChange('start', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tanggal Akhir</label>
                      <Input 
                        type="date" 
                        value={filters.date_end || ''} 
                        onChange={(e) => handleDateChange('end', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status Pembayaran</label>
                      <Select
                        value={filters.payment_status || ''}
                        onValueChange={(value) => {
                          window.location.href = route('cashier.transactions.index', {
                            ...filters,
                            payment_status: value || null
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Semua Status</SelectItem>
                          <SelectItem value="paid">Dibayar</SelectItem>
                          <SelectItem value="pending">Tertunda</SelectItem>
                          <SelectItem value="failed">Gagal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Metode Pembayaran</label>
                      <Select
                        value={filters.payment_method_id?.toString() || ''}
                        onValueChange={(value) => {
                          window.location.href = route('cashier.transactions.index', {
                            ...filters,
                            payment_method_id: value ? parseInt(value) : null
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Semua Metode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Semua Metode</SelectItem>
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

            <div className="mt-6 rounded-md border">
              <Table>
                <TableCaption>
                  Menampilkan {transactions.from || 0} - {transactions.to || 0} dari {transactions.total} transaksi
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Faktur</TableHead>
                    <TableHead>Tanggal & Waktu</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Metode Pembayaran</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
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
                        <TableCell>{transaction.payment_method.name}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(transaction.payment_status)}>
                            {transaction.payment_status === 'paid' && 'Dibayar'}
                            {transaction.payment_status === 'pending' && 'Tertunda'}
                            {transaction.payment_status === 'failed' && 'Gagal'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(transaction.total_amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => viewTransaction(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(route('cashier.transactions.print', { transaction }), '_blank')}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {transactions.last_page > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={transactions.current_page > 1
                        ? route('cashier.transactions.index', { ...filters, page: transactions.current_page - 1 })
                        : '#'
                      }
                      className={transactions.current_page <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {[...Array(transactions.last_page)].map((_, i) => {
                    const page = i + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === transactions.last_page ||
                      (page >= transactions.current_page - 1 && page <= transactions.current_page + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href={route('cashier.transactions.index', { ...filters, page })}
                            isActive={page === transactions.current_page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    // Add ellipsis after first page and before last page
                    if (page === 2 || page === transactions.last_page - 1) {
                      return <PaginationEllipsis key={`ellipsis-${page}`} />;
                    }
                    
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      href={transactions.current_page < transactions.last_page
                        ? route('cashier.transactions.index', { ...filters, page: transactions.current_page + 1 })
                        : '#'
                      }
                      className={transactions.current_page >= transactions.last_page ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transactionId={selectedTransaction.id}
          open={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </CashierLayout>
  );
};

export default TransactionIndex;