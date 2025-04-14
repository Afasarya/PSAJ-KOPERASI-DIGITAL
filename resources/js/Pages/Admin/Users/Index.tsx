// resources/js/Pages/Admin/Users/Index.tsx
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
  Loader2,
  Search, 
  Trash2,
  UserPlus
} from 'lucide-react';
import { Pagination } from '@/Components/Pagination';
import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from '@/Components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import axios from 'axios';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
  transactions_count: number;
  created_at: string;
}

interface UsersIndexProps {
  users: {
    data: User[];
    links: any[];
    from: number;
    to: number;
    total: number;
  };
  filters: {
    search?: string;
    role_id?: string;
  };
  roles: Role[];
  flash?: {
    success?: string;
    error?: string;
  };
}

const UsersIndex: React.FC<UsersIndexProps> = ({ users, filters, roles, flash }) => {
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(flash?.success ? { type: 'success', message: flash.success } : 
           flash?.error ? { type: 'error', message: flash.error } : null);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [roleId, setRoleId] = useState(filters.role_id || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = route('admin.users.index', { 
      search: searchTerm, 
      role_id: roleId === 'all' ? '' : roleId 
    });
  };

  const handleRoleChange = (value: string) => {
    setRoleId(value);
    window.location.href = route('admin.users.index', { 
      search: searchTerm, 
      role_id: value === 'all' ? '' : value 
    });
  };

  const handleDeleteUser = async (userId: number) => {
    setIsDeleting(true);
    
    try {
      await axios.delete(route('admin.users.destroy', userId));
      window.location.href = route('admin.users.index', { 
        search: searchTerm, 
        role_id: roleId === 'all' ? '' : roleId 
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      let errorMessage = '';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || '';
      }
      setAlert({
        type: 'error',
        message: 'Gagal menghapus pengguna. ' + errorMessage,
      });
      setIsDeleting(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'success';
      case 'kasir':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout title="Manajemen Pengguna">
      <Head title="Manajemen Pengguna" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Pengguna</h1>
        <Button asChild>
          <Link href={route('admin.users.create')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Tambah Pengguna
          </Link>
        </Button>
      </div>

      {alert && (
        <Alert 
          variant={alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'warning' : 'default'} 
          className="mb-4"
        >
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="bg-card rounded-lg shadow-sm border mb-6">
        <div className="p-4">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari pengguna berdasarkan nama atau email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={roleId} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Semua Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Role</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead>Transaksi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.length > 0 ? (
                users.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeColor(user.role.name)}>
                        {user.role.name}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{user.transactions_count}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">

                        <Button 
                          asChild 
                          variant="ghost" 
                          size="icon"
                        >
                          <Link href={route('admin.users.edit', user.id)}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setDeleteUserId(user.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus pengguna "{user.name}"?
                                {user.transactions_count > 0 && (
                                  <span className="mt-2 block font-semibold text-destructive">
                                    Pengguna ini memiliki {user.transactions_count} transaksi terkait.
                                    Tidak dapat menghapus pengguna yang memiliki data transaksi.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={isDeleting || user.transactions_count > 0}
                              >
                                {isDeleting && deleteUserId === user.id ? (
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
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <UserPlus className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">Tidak ada pengguna ditemukan</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tambahkan pengguna baru untuk sistem ini.
                      </p>
                      <Button asChild className="mt-4">
                        <Link href={route('admin.users.create')}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Tambah Pengguna
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
        {users.data.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {users.from} hingga {users.to} dari {users.total} pengguna
              </div>
              <Pagination links={users.links} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersIndex;