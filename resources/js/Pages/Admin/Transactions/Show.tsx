// resources/js/Pages/Admin/Transactions/Show.tsx
import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/Components/ui/badge';
import { 
  ArrowLeft,
  Calendar, 
  Clock,
  CreditCard, 
  Download, 
  FileText, 
  Loader2, 
  Package, 
  Printer, 
  ShoppingBag, 
  User as UserIcon,
  AlertTriangle,
  BarChart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Separator } from '@/Components/ui/separator';
import axios from 'axios';

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
    barcode: string | null;
  };
}

interface TransactionAnomaly {
  id: number;
  transaction_id: number;
  anomaly_type: string;
  anomaly_description: string;
  is_reviewed: boolean;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
}

interface Transaction {
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
    email: string;
  };
  items: TransactionItem[];
  anomaly?: TransactionAnomaly;
}

interface TransactionDetailProps {
  id: number; // transaction ID to fetch
  auth?: {
    user: {
      id: number;
    }
  }
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ id, auth }) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingAnomaly, setReviewingAnomaly] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTransactionDetail();
    }
  }, [id]);

  const fetchTransactionDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(route('admin.transactions.show', id));
      setTransaction(response.data.transaction);
    } catch (err) {
      console.error('Error fetching transaction detail:', err);
      setError('Gagal memuat detail transaksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAnomaly = async () => {
    if (!transaction?.anomaly) return;
    
    try {
      setReviewingAnomaly(true);
      await axios.put(route('admin.groq-ai.anomalies.review', transaction.anomaly.id));
      
      // Update the local state
      setTransaction(prev => {
        if (!prev || !prev.anomaly) return prev;
        
        return {
          ...prev,
          anomaly: {
            ...prev.anomaly,
            is_reviewed: true,
            reviewed_at: new Date().toISOString(),
            reviewed_by: auth?.user?.id || null,
          }
        };
      });
      
    } catch (error) {
      console.error('Error reviewing anomaly:', error);
    } finally {
      setReviewingAnomaly(false);
    }
  };

  const handlePrintReceipt = async () => {
    if (!transaction) return;
    
    try {
      setPrinting(true);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }
      
      // Load receipt content
      printWindow.document.write('<html><head><title>Loading receipt...</title></head><body>Loading receipt...</body></html>');
      
      // Get receipt HTML from backend - FIXED: Use admin route instead of cashier route
      const response = await axios.get(route('admin.transactions.print', transaction.id));
      const receiptHtml = response.data.receipt_html;
      
      // Update print window content and trigger print
      printWindow.document.open();
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      
      // Wait for images to load before printing
      setTimeout(() => {
        printWindow.print();
        // Don't close the window to allow the user to use browser's print dialog
      }, 500);
      
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Gagal mencetak struk, silakan coba lagi.');
    } finally {
      setPrinting(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!transaction) return;
    
    try {
      setDownloading(true);
      
      // FIXED: Use admin route instead of cashier route
      window.open(route('admin.transactions.download', transaction.id), '_blank');
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Gagal mengunduh invoice, silakan coba lagi.');
    } finally {
      setDownloading(false);
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

  const getAnomalyBadgeColor = (score: number | null) => {
    if (score === null) return 'secondary';
    if (score >= 0.7) return 'destructive';
    if (score >= 0.3) return 'warning';
    return 'secondary';
  };

  return (
    <AdminLayout title="Detail Transaksi">
      <Head title="Detail Transaksi" />

      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={route('admin.transactions.index')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Transaksi
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Memuat detail transaksi...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={fetchTransactionDetail} className="mt-4" variant="outline">
            Coba Lagi
          </Button>
        </Alert>
      ) : transaction ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                Invoice #{transaction.invoice_number}
                <Badge variant={getStatusBadgeVariant(transaction.payment_status)} className="ml-3">
                  {transaction.payment_status === 'paid' && 'Dibayar'}
                  {transaction.payment_status === 'pending' && 'Tertunda'}
                  {transaction.payment_status === 'failed' && 'Gagal'}
                </Badge>
                
                {transaction.anomaly_score !== null && transaction.anomaly_score >= 0.5 && (
                  <Badge variant="warning" className="ml-2">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Anomali
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground mt-1">
                {formatDate(transaction.created_at)} {formatTime(transaction.created_at)}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrintReceipt}
                disabled={printing}
              >
                {printing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4 mr-2" />
                )}
                Cetak Struk
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadInvoice}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Unduh Invoice PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={getStatusBadgeVariant(transaction.payment_status)}>
                    {transaction.payment_status === 'paid' && 'Dibayar'}
                    {transaction.payment_status === 'pending' && 'Tertunda'}
                    {transaction.payment_status === 'failed' && 'Gagal'}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metode:</span>
                  <span className="font-medium">{transaction.payment_method.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold">{formatCurrency(transaction.total_amount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah Item:</span>
                  <span>{transaction.items.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informasi Pelanggan & Kasir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pelanggan:</span>
                  <span>{transaction.customer_name || <span className="italic text-muted-foreground">Tanpa Nama</span>}</span>
                </div>

                <Separator className="my-2" />
                
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{transaction.user.name}</span>
                </div>
                
                <div className="text-sm text-muted-foreground pl-6">
                  {transaction.user.email}
                </div>
              </CardContent>
            </Card>

            {transaction.anomaly_score !== null && (
              <Card className={transaction.anomaly_score >= 0.7 ? 'border-destructive' : transaction.anomaly_score >= 0.3 ? 'border-warning' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2" />
                    Deteksi Anomali
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Skor Anomali:</span>
                    <Badge variant={getAnomalyBadgeColor(transaction.anomaly_score)}>
                      {(transaction.anomaly_score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  
                  {transaction.anomaly && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipe:</span>
                        <span>{transaction.anomaly.anomaly_type}</span>
                      </div>
                      
                      <div className="mt-2">
                        <span className="text-muted-foreground text-sm">Deskripsi:</span>
                        <p className="text-sm mt-1">{transaction.anomaly.anomaly_description}</p>
                      </div>
                      
                      <div className="flex justify-between mt-2">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={transaction.anomaly.is_reviewed ? 'outline' : 'secondary'}>
                          {transaction.anomaly.is_reviewed ? 'Sudah Direview' : 'Belum Direview'}
                        </Badge>
                      </div>
                      
                      {!transaction.anomaly.is_reviewed && (
                        <Button 
                          className="w-full mt-2" 
                          size="sm"
                          onClick={handleReviewAnomaly}
                          disabled={reviewingAnomaly}
                        >
                          {reviewingAnomaly ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Menandai...
                            </>
                          ) : (
                            'Tandai Sudah Direview'
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Transaction Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>SKU / Barcode</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product.name}
                        {item.is_recommended && (
                          <Badge variant="outline" className="ml-2">Rekomendasi</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">{item.product.sku}</div>
                        {item.product.barcode && (
                          <div className="text-xs">{item.product.barcode}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex flex-col items-end mt-6 space-y-1">
                <div className="flex w-full max-w-xs justify-between">
                  <span>Total Item:</span>
                  <span>{transaction.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex w-full max-w-xs justify-between border-t pt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(transaction.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert>
          <AlertDescription>Transaksi tidak ditemukan</AlertDescription>
        </Alert>
      )}
    </AdminLayout>
  );
};

export default TransactionDetail;