
import { useState } from 'react';
import { Search, Store, Users, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for demonstration
  const featuredProducts = [
    {
      id: 1,
      title: 'Keripik Singkong Original',
      price: 15000,
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop',
      seller: 'Snack Ibu Sari',
      location: 'Bekasi Timur',
      condition: 'Baru',
      isNew: true
    },
    {
      id: 2,
      title: 'Tas Rajut Handmade',
      price: 75000,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
      seller: 'Kerajinan Mbok Yem',
      location: 'Bekasi Barat',
      condition: 'Baru',
      isNew: false
    },
    {
      id: 3,
      title: 'Sambal Terasi Premium',
      price: 25000,
      image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&h=300&fit=crop',
      seller: 'Dapur Nusantara',
      location: 'Tambun Selatan',
      condition: 'Baru',
      isNew: true
    },
    {
      id: 4,
      title: 'Batik Tulis Bekasi',
      price: 150000,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop',
      seller: 'Batik Nusantara',
      location: 'Bekasi Utara',
      condition: 'Baru',
      isNew: false
    }
  ];

  const categories = [
    { name: 'Makanan & Minuman', icon: '🍽️', count: 245 },
    { name: 'Fashion', icon: '👕', count: 189 },
    { name: 'Kerajinan', icon: '🎨', count: 156 },
    { name: 'Elektronik', icon: '📱', count: 98 },
    { name: 'Perawatan', icon: '💄', count: 87 },
    { name: 'Rumah Tangga', icon: '🏠', count: 134 }
  ];

  const featuredUMKM = [
    {
      name: 'Warung Mbok Sari',
      description: 'Makanan tradisional dan jajanan pasar terlengkap',
      products: 23,
      rating: 4.8
    },
    {
      name: 'Kerajinan Bambu Jaya',
      description: 'Kerajinan bambu berkualitas untuk dekorasi rumah',
      products: 15,
      rating: 4.9
    },
    {
      name: 'Fashion Hijab Modern',
      description: 'Koleksi hijab dan busana muslim terkini',
      products: 34,
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-teal-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Temukan & Dukung UMKM Lokal Bekasi!
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Platform jual beli khusus untuk usaha mikro, kecil, dan menengah di Bekasi
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <Input
              type="text"
              placeholder="Cari produk di Bekasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-white text-gray-900 border-0 rounded-full shadow-lg"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-blue-600 hover:text-blue-700">
              Mulai Belanja
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              Jual Barang Anda
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Store className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600">UMKM Terdaftar</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">2,500+</h3>
              <p className="text-gray-600">Pengguna Aktif</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">4.8</h3>
              <p className="text-gray-600">Rating Rata-rata</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Produk Terbaru</h2>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              Lihat Semua <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Kategori Populer</h2>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              Lihat Semua <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.count} produk</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured UMKM */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">UMKM Unggulan</h2>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              Lihat Semua <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredUMKM.map((umkm, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      {umkm.name.charAt(0)}
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">{umkm.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{umkm.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{umkm.description}</p>
                  <p className="text-blue-600 text-sm font-medium">{umkm.products} produk tersedia</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
