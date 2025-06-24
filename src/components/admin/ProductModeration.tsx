import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Eye, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type User = Tables<'users'>;

interface ProductWithSeller extends Product {
  title: any;
  seller?: User;
  category?: { name: string };
}

export const ProductModeration = () => {
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSeller | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:users!products_seller_id_fkey(
            id,
            name,
            email,
            avatar_url
          ),
          category:categories(
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts((productsData as ProductWithSeller[]) || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (productId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId);

      if (error) throw error;

      toast.success('Status produk berhasil diperbarui');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Gagal memperbarui status produk');
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
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Gagal menghapus produk');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'sold': return 'secondary';
      case 'inactive': return 'outline';
      case 'pending': return 'destructive';
      default: return 'outline';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Moderasi Produk</CardTitle>
          <CardDescription>Kelola dan moderasi listing produk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderasi Produk</CardTitle>
        <CardDescription>
          Kelola {products.length} produk yang terdaftar di platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari produk atau penjual..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="sold">Terjual</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Penjual</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.title || ''}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-400 text-xs">No Image</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium line-clamp-1">{product.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.seller?.name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">{product.seller?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{product.category?.name || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatPrice(product.price || 0)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(product.status || 'active')}>
                        {product.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(product.created_at || '')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detail Produk</DialogTitle>
                              <DialogDescription>
                                Informasi lengkap produk untuk moderasi
                              </DialogDescription>
                            </DialogHeader>
                            {selectedProduct && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Judul</label>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.title}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Harga</label>
                                    <p className="text-sm text-muted-foreground">{formatPrice(selectedProduct.price || 0)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Kategori</label>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.category?.name || '-'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Badge variant={getStatusBadgeVariant(selectedProduct.status || 'active')}>
                                      {selectedProduct.status || 'active'}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Deskripsi</label>
                                  <p className="text-sm text-muted-foreground mt-1">{selectedProduct.description}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Penjual</label>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedProduct.seller?.name} ({selectedProduct.seller?.email})
                                  </p>
                                </div>
                                {selectedProduct.images && selectedProduct.images.length > 0 && (
                                  <div>
                                    <label className="text-sm font-medium">Gambar</label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                      {selectedProduct.images.map((image, index) => (
                                        <img 
                                          key={index}
                                          src={image} 
                                          alt={`Product ${index + 1}`}
                                          className="h-20 w-20 object-cover rounded border"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Select
                          value={product.status || 'active'}
                          onValueChange={(newStatus) => updateProductStatus(product.id, newStatus)}
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Tidak Aktif</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="sold">Terjual</SelectItem>
                          </SelectContent>
                        </Select>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus produk "{product.title}"? 
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteProduct(product.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Tidak ada produk yang ditemukan</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};