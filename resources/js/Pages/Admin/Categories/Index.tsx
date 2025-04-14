import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { 
  Edit, 
  Eye, 
  FolderPlus, 
  Loader2,
  Search, 
  Trash2 
} from 'lucide-react';
import { Pagination } from '@/Components/Pagination';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/Components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  description: string | null;
  products_count: number;
  created_at: string;
  updated_at: string;
}

interface CategoriesIndexProps {
  categories: {
    data: Category[];
    links: any[];
    from: number;
    to: number;
    total: number;
  };
  filters: {
    search?: string;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const CategoriesIndex: React.FC<CategoriesIndexProps> = ({ categories, filters, flash }) => {
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(flash?.success ? { type: 'success', message: flash.success } : 
           flash?.error ? { type: 'error', message: flash.error } : null);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = route('admin.categories.index', { search: searchTerm });
  };

  const handleDeleteCategory = async (categoryId: number) => {
    setIsDeleting(true);
    
    try {
      await axios.delete(route('admin.categories.destroy', categoryId));
      window.location.href = route('admin.categories.index');
    } catch (error) {
      console.error('Error deleting category:', error);
      let errorMessage = '';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || '';
      }
      setAlert({
        type: 'error',
        message: 'Gagal menghapus kategori. ' + errorMessage,
      });
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout title="Manajemen Kategori">
      <Head title="Manajemen Kategori" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Kategori</h1>
        <Button asChild>
          <Link href={route('admin.categories.create')}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Tambah Kategori
          </Link>
        </Button>
      </div>

      {alert && (
        <Alert 
          variant={alert.type === 'error' ? 'destructive' : alert.type} 
          className="mb-4"
        >
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="bg-card rounded-lg shadow-sm border mb-6">
        <div className="p-4">
          <form onSubmit={handleSearch}>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari kategori..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama Kategori</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Jumlah Produk</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.data.length > 0 ? (
                categories.data.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{category.products_count}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          asChild 
                          variant="ghost" 
                          size="icon"
                        >
                          <Link href={route('admin.categories.show', category.id)}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          asChild 
                          variant="ghost" 
                          size="icon"
                        >
                          <Link href={route('admin.categories.edit', category.id)}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setDeleteCategoryId(category.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus kategori "{category.name}"? 
                                {category.products_count > 0 && (
                                  <span className="mt-2 block font-semibold text-destructive">
                                    Kategori ini memiliki {category.products_count} produk terkait.
                                    Hapus atau pindahkan produk-produk tersebut terlebih dahulu.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteCategory(category.id)}
                                disabled={isDeleting || category.products_count > 0}
                              >
                                {isDeleting && deleteCategoryId === category.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Menghapus...
                                  </>
                                ) : 'Hapus'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <FolderPlus className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">Tidak ada kategori ditemukan</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tambahkan kategori baru untuk mengelompokkan produk.
                      </p>
                      <Button asChild className="mt-4">
                        <Link href={route('admin.categories.create')}>
                          <FolderPlus className="h-4 w-4 mr-2" />
                          Tambah Kategori
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {categories.data.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {categories.from} hingga {categories.to} dari {categories.total} kategori
              </div>
              <Pagination links={categories.links} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoriesIndex;