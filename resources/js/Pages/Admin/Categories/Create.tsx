import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/text-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft, FolderPlus, Loader2 } from 'lucide-react';
import { Label } from '@/Components/ui/label';

const CreateCategory: React.FC = () => {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.categories.store'));
  };

  return (
    <AdminLayout title="Tambah Kategori">
      <Head title="Tambah Kategori" />

      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={route('admin.categories.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Kategori
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <FolderPlus className="h-5 w-5 mr-2 text-primary" />
            Tambah Kategori Baru
          </CardTitle>
          <CardDescription>
            Kategori digunakan untuk mengelompokkan produk berdasarkan jenisnya.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-base">Nama Kategori</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="mt-1"
                  placeholder="Masukkan nama kategori"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description" className="text-base">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="mt-1"
                  placeholder="Masukkan deskripsi singkat tentang kategori ini"
                  rows={4}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                )}
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
                <>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Simpan Kategori
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AdminLayout>
  );
};

export default CreateCategory;