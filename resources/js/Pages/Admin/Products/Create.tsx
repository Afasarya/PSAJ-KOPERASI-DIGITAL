import React, { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/text-area';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/Components/ui/card';
import { Switch } from '@/Components/ui/switch';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { ArrowLeft, Loader2, Package } from 'lucide-react';
import BarcodeScanner from '@/Components/BarcodeScanner';

interface Category {
  id: number;
  name: string;
}

interface CreateProductProps {
  categories: Category[];
}

const CreateProduct: React.FC<CreateProductProps> = ({ categories }) => {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    price_buy: '',
    price_sell: '',
    category_id: '',
    image: null as File | null,
    is_active: true as boolean,
    initial_stock: '0',
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('image', file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    setData('barcode', barcode);
    setIsScannerOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.products.store'));
  };

  return (
    <AdminLayout title="Tambah Produk Baru">
      <Head title="Tambah Produk" />

      <div className="mb-6">
        <Button variant="outline" asChild>
          <a href={route('admin.products.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Produk
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Produk Baru</CardTitle>
          <CardDescription>
            Masukkan informasi produk yang akan ditambahkan ke database.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Dasar</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nama Produk *</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="category_id">Kategori *</Label>
                  <Select
                    value={data.category_id}
                    onValueChange={(value) => setData('category_id', value)}
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
                  {errors.category_id && (
                    <p className="text-sm text-destructive mt-1">{errors.category_id}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={data.sku}
                    onChange={(e) => setData('sku', e.target.value)}
                    required
                  />
                  {errors.sku && (
                    <p className="text-sm text-destructive mt-1">{errors.sku}</p>
                  )}
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsScannerOpen(true)}
                    >
                      Scan
                    </Button>
                  </div>
                  <Input
                    id="barcode"
                    value={data.barcode}
                    onChange={(e) => setData('barcode', e.target.value)}
                  />
                  {errors.barcode && (
                    <p className="text-sm text-destructive mt-1">{errors.barcode}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Harga</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="price_buy">Harga Beli *</Label>
                  <Input
                    id="price_buy"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.price_buy}
                    onChange={(e) => setData('price_buy', e.target.value)}
                    required
                  />
                  {errors.price_buy && (
                    <p className="text-sm text-destructive mt-1">{errors.price_buy}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="price_sell">Harga Jual *</Label>
                  <Input
                    id="price_sell"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.price_sell}
                    onChange={(e) => setData('price_sell', e.target.value)}
                    required
                  />
                  {errors.price_sell && (
                    <p className="text-sm text-destructive mt-1">{errors.price_sell}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Inventaris</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="initial_stock">Stok Awal</Label>
                  <Input
                    id="initial_stock"
                    type="number"
                    min="0"
                    value={data.initial_stock}
                    onChange={(e) => setData('initial_stock', e.target.value)}
                  />
                  {errors.initial_stock && (
                    <p className="text-sm text-destructive mt-1">{errors.initial_stock}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked: boolean) => setData('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Produk Aktif</Label>
                  {errors.is_active && (
                    <p className="text-sm text-destructive mt-1">{errors.is_active}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Gambar Produk</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="image">Unggah Gambar</Label>
                  <Input
                    id="image"
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Gambar harus berformat JPG, PNG, atau GIF dengan ukuran maksimal 2MB.
                  </p>
                  {errors.image && (
                    <p className="text-sm text-destructive mt-1">{errors.image}</p>
                  )}
                </div>
                
                <div className="border rounded-md p-4 flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-32 object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Package className="h-10 w-10 mb-2" />
                      <p className="text-sm">Pratinjau gambar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Batal
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Produk'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner 
          onDetected={handleBarcodeDetected} 
          onClose={() => setIsScannerOpen(false)}
          scanPurpose="product_info"
        />
      )}
    </AdminLayout>
  );
};

export default CreateProduct;