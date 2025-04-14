// resources/js/Pages/Cashier/Transactions/Print.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CashierLayout from '@/Layouts/CashierLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft, Download, Loader2, Printer } from 'lucide-react';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import axios from 'axios';

interface Transaction {
  id: number;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  created_at: string;
  items: Array<{
    id: number;
    product: {
      name: string;
    };
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  payment_method: {
    name: string;
  };
}

interface PrintProps {
  transaction: Transaction;
}

const Print: React.FC<PrintProps> = ({ transaction }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptHtml, setReceiptHtml] = useState<string | null>(null);
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const fetchReceiptHtml = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(route('cashier.transactions.print', transaction.id));
      setReceiptHtml(response.data.receipt_html);
    } catch (err) {
      console.error('Error fetching receipt:', err);
      setError('Gagal mengambil data struk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (printFrameRef.current && printFrameRef.current.contentWindow) {
      // Apply print-specific styling
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body {
            font-family: 'Courier New', monospace;
            width: 80mm; /* Standard receipt width */
            margin: 0;
            padding: 5mm;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 10px;
          }
          .receipt-items {
            width: 100%;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            margin: 10px 0;
            padding: 10px 0;
          }
          .receipt-total {
            text-align: right;
            font-weight: bold;
          }
          .receipt-footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
          }
        }
      `;

      // Print the iframe content
      const contentWindow = printFrameRef.current.contentWindow;
      contentWindow.document.head.appendChild(style);
      contentWindow.focus();
      contentWindow.print();
    }
  };

  const handleDownloadPdf = () => {
    window.location.href = route('cashier.transactions.download', transaction.id);
  };

  useEffect(() => {
    fetchReceiptHtml();
  }, [transaction.id]);

  // Set up the iframe content when receiptHtml is available
  useEffect(() => {
    if (receiptHtml && printFrameRef.current && printFrameRef.current.contentWindow) {
      const doc = printFrameRef.current.contentDocument || printFrameRef.current.contentWindow.document;
      doc.open();
      doc.write(receiptHtml);
      doc.close();
    }
  }, [receiptHtml]);

  return (
    <CashierLayout title={`Cetak Struk #${transaction.invoice_number}`}>
      <Head title={`Cetak Struk #${transaction.invoice_number}`} />

      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={route('cashier.transactions.index')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Transaksi
          </Link>
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Cetak Struk Transaksi #{transaction.invoice_number}</CardTitle>
            <CardDescription>
              Cetak atau unduh struk untuk transaksi {transaction.customer_name || 'Pelanggan'}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="border rounded-md p-4 bg-muted/30">
                <h3 className="font-medium mb-2">Informasi Transaksi</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Nomor Invoice:</div>
                  <div className="font-medium">{transaction.invoice_number}</div>
                  
                  <div>Tanggal:</div>
                  <div className="font-medium">
                    {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  
                  <div>Metode Pembayaran:</div>
                  <div className="font-medium">{transaction.payment_method.name}</div>
                  
                  <div>Total:</div>
                  <div className="font-medium">
                    Rp {transaction.total_amount.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div className="h-[400px] border rounded-md relative">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Memuat struk...</span>
                  </div>
                ) : (
                  <iframe
                    ref={printFrameRef}
                    className="w-full h-full"
                    title={`Receipt for ${transaction.invoice_number}`}
                    style={{ border: 'none' }}
                  />
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={route('cashier.transactions.index')}>Kembali</Link>
            </Button>
            <div className="flex space-x-2">
              <Button onClick={handleDownloadPdf} variant="outline" disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                Unduh PDF
              </Button>
              <Button onClick={handlePrint} disabled={loading || !receiptHtml}>
                <Printer className="h-4 w-4 mr-2" />
                Cetak Struk
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </CashierLayout>
  );
};

export default Print;