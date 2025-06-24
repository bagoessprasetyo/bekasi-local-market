import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Package, MapPin, User, Grid, List } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';

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
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedCondition !== 'all') params.set('condition', selectedCondition);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchTerm, selectedCategory, selectedCondition, sortBy, setSearchParams]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            icon
          ),
          users (
            name,
            location
          )
        `)
        .eq('status', 'available')
        .eq('is_active', true);

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        default: // newest
          query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal memuat produk');
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.users?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || product.condition === selectedCondition;
    
    const matchesPriceRange = (
      (!priceRange.min || product.price >= parseInt(priceRange.min)) &&
      (!priceRange.max || product.price <= parseInt(priceRange.max))
    );
    
    return matchesSearch && matchesCategory && matchesCondition && matchesPriceRange;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the filteredProducts effect
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSortBy('newest');
    setPriceRange({ min: '', max: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Jelajahi Produk</h1>
          <p className="text-gray-600">Temukan produk UMKM lokal terbaik di Bekasi</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Cari produk, penjual, atau deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kondisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kondisi</SelectItem>
                  <SelectItem value="new">Baru</SelectItem>
                  <SelectItem value="used">Bekas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                  <SelectItem value="price_low">Harga Terendah</SelectItem>
                  <SelectItem value="price_high">Harga Tertinggi</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  placeholder="Min harga"
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="flex-1"
                />
                <Input
                  placeholder="Max harga"
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {filteredProducts.length} produk ditemukan
                </span>
                {(searchTerm || selectedCategory !== 'all' || selectedCondition !== 'all' || priceRange.min || priceRange.max) && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <Filter className="w-4 h-4 mr-2" />
                    Hapus Filter
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Memuat produk...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak ada produk ditemukan
              </h3>
              <p className="text-gray-600 mb-6">
                Coba ubah filter pencarian atau kata kunci
              </p>
              <Button onClick={clearFilters}>
                Hapus Semua Filter
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              viewMode === 'grid' ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex">
                    <div className="w-48 h-32 flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {product.name}
                        </h3>
                        <Badge variant={product.condition === 'new' ? 'default' : 'secondary'}>
                          {product.condition === 'new' ? 'Baru' : 'Bekas'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-blue-600">
                            {formatPrice(product.price)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="w-3 h-3 mr-1" />
                            <span>{product.users?.name}</span>
                            {product.users?.location && (
                              <>
                                <span className="mx-1">•</span>
                                <MapPin className="w-3 h-3 mr-1" />
                                <span>{product.users.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <Button size="sm" onClick={() => window.location.href = `/products/${product.id}`}>
                          Lihat Detail
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Browse;