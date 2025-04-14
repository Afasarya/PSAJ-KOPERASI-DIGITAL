import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
}

interface NewProductFormProps {
  barcode: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

const NewProductForm: React.FC<NewProductFormProps> = ({
  barcode,
  onSubmit,
  onCancel,
  isProcessing
}) => {
  const [name, setName] = useState('');
  const [priceBuy, setPriceBuy] = useState('');
  const [priceSell, setPriceSell] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [initialStock, setInitialStock] = useState('1');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      name,
      price_buy: parseFloat(priceBuy),
      price_sell: parseFloat(priceSell),
      category_id: parseInt(categoryId),
      initial_stock: parseInt(initialStock),
    });
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Daftarkan Produk Baru</DialogTitle>
          <DialogDescription>
            Produk dengan barcode {barcode} belum terdaftar. Silakan isi informasi produk.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="price_buy">Harga Beli</Label>
              <Input
                id="price_buy"
                type="number"
                min="0"
                step="0.01"
                value={priceBuy}
                onChange={(e) => setPriceBuy(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="price_sell">Harga Jual</Label>
              <Input
                id="price_sell"
                type="number"
                min="0"
                step="0.01"
                value={priceSell}
                onChange={(e) => setPriceSell(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="initial_stock">Stok Awal</Label>
              <Input
                id="initial_stock"
                type="number"
                min="0"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" disabled={isProcessing || isLoading}>
              {isProcessing ? 'Menyimpan...' : 'Simpan Produk'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewProductForm;