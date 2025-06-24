import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  TrendingUp,
  AlertCircle,
  Filter,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[] | null;
  category_id: string | null;
  stock: number | null;
  condition: string | null;
  status: string | null;
  is_active: boolean | null;
  views_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  categories?: {
    name: string;
    icon: string;
  };
}

interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  totalViews: number;
}

const ManageProducts = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    totalViews: 0
  });
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            icon
          )
        `)
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal memuat produk');
    } finally {
      setProductsLoading(false);
    }
  };

  const calculateStats = (productList: Product[]) => {
    const stats = productList.reduce(
      (acc, product) => {
        acc.total++;
        acc.totalViews += product.views_count || 0;
        
        if (product.is_active) {
          acc.active++;
        } else {
          acc.inactive++;
        }
        
        if (product.status === 'pending') {
          acc.pending++;
        }
        
        return acc;
      },
      { total: 0, active: 0, inactive: 0, pending: 0, totalViews: 0 }
    );
    
    setStats(stats);
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(product => product.is_active);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(product => !product.is_active);
      } else {
        filtered = filtered.filter(product => product.status === statusFilter);
      }
    }

    setFilteredProducts(filtered);
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast.success(`Produk ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Gagal mengubah status produk');
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Produk berhasil dihapus');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Gagal menghapus produk');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (product: Product) => {
    if (!product.is_active) {
      return <Badge variant="secondary">Tidak Aktif</Badge>;
    }
    
    switch (product.status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Menunggu Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">Aktif</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Anda harus login terlebih dahulu untuk mengelola produk.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Produk</h1>
            <p className="text-gray-600 mt-1">Kelola semua produk yang Anda jual</p>
          </div>
          <Button onClick={() => navigate('/products/create')} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Produk</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Produk Aktif</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tidak Aktif</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                </div>
                <EyeOff className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalViews}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    <SelectItem value="pending">Menunggu Review</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        {productsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat produk...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {products.length === 0 ? 'Belum Ada Produk' : 'Tidak Ada Produk yang Sesuai'}
              </h3>
              <p className="text-gray-600 mb-6">
                {products.length === 0 
                  ? 'Mulai berjualan dengan menambahkan produk pertama Anda'
                  : 'Coba ubah filter atau kata kunci pencarian'
                }
              </p>
              {products.length === 0 && (
                <Button onClick={() => navigate('/products/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Produk Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-white/80 hover:bg-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/products/${product.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Produk
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/products/${product.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Produk
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleProductStatus(product.id, product.is_active || false)}
                        >
                          {product.is_active ? (
                            <><EyeOff className="h-4 w-4 mr-2" />Nonaktifkan</>
                          ) : (
                            <><Eye className="h-4 w-4 mr-2" />Aktifkan</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteProductId(product.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                      {getStatusBadge(product)}
                    </div>
                    
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Stok: {product.stock || 0}</span>
                      <span>Views: {product.views_count || 0}</span>
                    </div>
                    
                    {product.categories && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span>{product.categories.icon}</span>
                        <span>{product.categories.name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteProductId) {
                    deleteProduct(deleteProductId);
                    setDeleteProductId(null);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ManageProducts;