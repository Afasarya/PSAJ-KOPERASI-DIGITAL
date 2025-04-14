// resources/js/Pages/Cashier/Transactions/TransactionDetailModal.tsx
import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/Components/ui/badge';
import { 
  CreditCard, 
  Download, 
  Loader2, 
  Printer, 
  User,
  Calendar, 
  ShoppingBag,
  Clock
} from 'lucide-react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';

// Import simplified components
import { Separator } from '@/Components/SimpleComponents';

interface TransactionDetailProps {
  transactionId: number;
  open: boolean;
  onClose: () => void;
}

interface TransactionItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  is_recommended: boolean;
  product: {
    id: number;
    name: string;
    sku: string;
  };
}

interface TransactionDetail {
  id: number;
  invoice_number: string;
  customer_name: string | null;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed';
  anomaly_score: number | null;
  created_at: string;
  payment_method: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
  };
  items: TransactionItem[];
}

const TransactionDetailModal: React.FC<TransactionDetailProps> = ({ 
  transactionId, 
  open, 
  onClose 
}) => {
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && transactionId) {
      fetchTransactionDetail();
    }
  }, [open, transactionId]);

  const fetchTransactionDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use the correct route with the correct parameter name
      const response = await axios.get(route('cashier.transactions.show', transactionId));
      setTransaction(response.data.transaction);
    } catch (err) {
      console.error('Error fetching transaction detail:', err);
      setError('Gagal memuat detail transaksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
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
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const printReceipt = () => {
    // Use the correct route with the correct parameter
    window.open(route('cashier.transactions.print', transactionId), '_blank');
  };

  const downloadInvoice = () => {
    // Use the correct route with the correct parameter
    window.open(route('cashier.transactions.download', transactionId), '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Memuat detail transaksi...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-destructive">
            <p>{error}</p>
            <Button variant="outline" onClick={fetchTransactionDetail} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        ) : transaction ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Detail Transaksi</span>
                <Badge variant={getStatusBadgeVariant(transaction.payment_status)}>
                  {transaction.payment_status === 'paid' && 'Dibayar'}
                  {transaction.payment_status === 'pending' && 'Tertunda'}
                  {transaction.payment_status === 'failed' && 'Gagal'}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                <div className="pt-2 text-xl font-semibold">{transaction.invoice_number}</div>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Tanggal: {formatDate(transaction.created_at)}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Waktu: {formatTime(transaction.created_at)}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>Kasir: {transaction.user.name}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Metode Pembayaran: {transaction.payment_method.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>
                      Pelanggan: {transaction.customer_name || <span className="italic">Tanpa Nama</span>}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    <span>Jumlah Item: {transaction.items.length}</span>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-border" /> {/* Simplified separator */}

              {/* Transaction Items */}
              <div>
                <h3 className="text-sm font-medium mb-2">Item Transaksi</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transaction.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-xs text-muted-foreground">{item.product.sku}</div>
                              {item.is_recommended && (
                                <Badge variant="outline" className="mt-1 text-xs">Rekomendasi</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Transaction Summary */}
              <div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl">{formatCurrency(transaction.total_amount)}</span>
                </div>
                
                {transaction.anomaly_score !== null && (
                  <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                    <div className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Skor Anomali: {transaction.anomaly_score.toFixed(2)}
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      {transaction.anomaly_score > 0.7 
                        ? 'Transaksi ini memiliki skor anomali tinggi. Mohon periksa kembali.'
                        : transaction.anomaly_score > 0.3 
                        ? 'Transaksi ini memiliki skor anomali sedang.'
                        : 'Transaksi ini memiliki skor anomali rendah.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={printReceipt}>
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak Struk
                </Button>
                <Button variant="outline" onClick={downloadInvoice}>
                  <Download className="mr-2 h-4 w-4" />
                  Unduh Invoice
                </Button>
                <Button onClick={onClose}>Tutup</Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Tidak dapat menemukan transaksi
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;