import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, User, Calendar, Package, Edit, MessageCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category_id: string;
  stock: number;
  condition: string;
  status: string;
  created_at: string;
  seller_id: string;
  location: string;
  categories?: {
    name: string;
    icon: string;
  };
  users?: {
    name: string;
    location: string;
    phone: string;
  };
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // First get the product data
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (productError) throw productError;
      
      // Then get category data
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('name, icon')
        .eq('id', productData.category_id)
        .single();
      
      // Then get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, location, phone')
        .eq('id', productData.seller_id)
        .single();
      
      // Combine the data
      const combinedProduct: Product = {
        ...productData,
        categories: categoryData || undefined,
        users: userData || undefined
      };
      
      setProduct(combinedProduct);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Gagal memuat detail produk');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: 'Tersedia', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      sold: { label: 'Terjual', variant: 'secondary' as const, color: 'bg-red-100 text-red-800' },
      draft: { label: 'Draft', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const isOwner = user?.id === product?.seller_id;

  const handleContactSeller = () => {
    if (product?.users?.phone) {
      const message = `Halo, saya tertarik dengan produk "${product.name}" yang Anda jual di Bekasi Local Market.`;
      const whatsappUrl = `https://wa.me/${product.users.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      toast.error('Nomor telepon penjual tidak tersedia');
    }
  };

  const handleStartChat = async () => {
    if (!user || !product) {
      toast.error('Anda harus login terlebih dahulu');
      return;
    }

    try {
      // Check if chat already exists
      const { data: existingChat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', product.seller_id)
        .eq('product_id', product.id)
        .single();

      if (chatError && chatError.code !== 'PGRST116') {
        throw chatError;
      }

      if (existingChat) {
        navigate(`/chat/${existingChat.id}`);
        return;
      }

      // Create new chat
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          buyer_id: user.id,
          seller_id: product.seller_id,
          product_id: product.id
        })
        .select('id')
        .single();

      if (createError) throw createError;

      navigate(`/chat/${newChat.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Gagal memulai chat');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Memuat detail produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Produk tidak ditemukan</h2>
        <p className="text-gray-600 mb-6">Produk yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
        <Button onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        {isOwner && (
          <Button onClick={() => navigate(`/products/${product.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Produk
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>
          </Card>
          
          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative overflow-hidden rounded border-2 transition-colors ${
                    currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {getStatusBadge(product.status)}
            </div>
            
            <div className="text-3xl font-bold text-blue-600 mb-4">
              {formatPrice(product.price)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <Package className="w-4 h-4 mr-2" />
                <span>Stok: {product.stock}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">Kondisi: {product.condition === 'new' ? 'Baru' : 'Bekas'}</span>
              </div>
              {product.categories && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">{product.categories.icon}</span>
                  <span>{product.categories.name}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(product.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Deskripsi</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>

          <Separator />

          {/* Seller Info */}
          {product.users && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Informasi Penjual</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{product.users.name}</span>
                </div>
                {product.users.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{product.users.location}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isOwner && product.status === 'available' && (
            <div className="space-y-3">
              <Button 
                onClick={handleStartChat}
                className="w-full"
                size="lg"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat dengan Penjual
              </Button>
              
              {product.users?.phone && (
                <Button 
                  onClick={handleContactSeller}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Hubungi via WhatsApp
                </Button>
              )}
            </div>
          )}
          
          {product.status === 'sold' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-center font-medium">
                Produk ini sudah terjual
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;