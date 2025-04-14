import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/Components/ui/card';
import { Check, CreditCard, Receipt } from 'lucide-react';

interface PaymentMethod {
  id: number;
  name: string;
}

interface PaymentModalProps {
  total: number;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  onConfirm: (paymentMethodId: number) => void;
  isProcessing: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  total,
  paymentMethods,
  onClose,
  onConfirm,
  isProcessing
}) => {
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [cashAmount, setCashAmount] = useState('');
  
  const handleCashAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setCashAmount(value);
    }
  };
  
  const handleConfirm = () => {
    if (selectedMethod !== null) {
      onConfirm(selectedMethod);
    }
  };
  
  const getChange = () => {
    if (!cashAmount || selectedMethod !== paymentMethods.find(m => m.name === 'Tunai')?.id) {
      return 0;
    }
    
    const amount = parseFloat(cashAmount);
    return Math.max(amount - total, 0);
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proses Pembayaran</DialogTitle>
          <DialogDescription>
            Pilih metode pembayaran dan konfirmasi transaksi
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="text-center pb-2 border-b">
            <span className="text-sm font-medium text-muted-foreground">Total Pembayaran</span>
            <div className="text-3xl font-bold">{formatCurrency(total)}</div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium mb-2">Metode Pembayaran</h3>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-colors ${
                    selectedMethod === method.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <span>{method.name}</span>
                    {selectedMethod === method.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Cash amount input (only for Cash payment) */}
          {selectedMethod === paymentMethods.find(m => m.name === 'Tunai')?.id && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Jumlah Uang</h3>
              <Input
                type="text"
                value={cashAmount}
                onChange={handleCashAmountChange}
                placeholder="Masukkan jumlah uang"
              />
              
              {parseFloat(cashAmount) > 0 && (
                <div className="flex justify-between text-sm pt-2">
                  <span className="font-medium">Kembalian:</span>
                  <span className="font-bold">{formatCurrency(getChange())}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={
              isProcessing || 
              selectedMethod === null || 
              (selectedMethod === paymentMethods.find(m => m.name === 'Tunai')?.id && 
                (parseFloat(cashAmount) < total || !cashAmount))
            }
          >
            {isProcessing ? (
              'Memproses...'
            ) : (
              <>
                <Receipt className="h-4 w-4 mr-2" />
                Selesaikan Transaksi
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;