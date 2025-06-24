import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ProductForm from '@/components/products/ProductForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Store, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AddProduct = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleProductSuccess = () => {
    toast.success('Produk berhasil ditambahkan!');
    navigate('/products');
  };

  const handleBackToProducts = () => {
    navigate('/products');
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
            Anda harus login terlebih dahulu untuk menambahkan produk.
          </AlertDescription>
        </Alert>
      </div>
    );
  }



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackToProducts}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tambah Produk Baru</h1>
            <p className="text-gray-600 mt-1">
              Lengkapi informasi produk Anda untuk mulai berjualan
            </p>
          </div>
        </div>

        {/* Tips Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips untuk Produk yang Menarik:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Gunakan foto produk yang jelas dan berkualitas tinggi</li>
              <li>• Tulis deskripsi yang detail dan informatif</li>
              <li>• Tentukan harga yang kompetitif</li>
              <li>• Pilih kategori yang tepat untuk produk Anda</li>
              <li>• Pastikan stok produk selalu update</li>
            </ul>
          </CardContent>
        </Card>

        {/* Product Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Informasi Produk
            </CardTitle>
            <CardDescription>
              Isi semua informasi produk dengan lengkap dan akurat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm onSuccess={handleProductSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProduct;