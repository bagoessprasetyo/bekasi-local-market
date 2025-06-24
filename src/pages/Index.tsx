import { useEffect, useState } from 'react';
import { Search, Store, Users, Star, ArrowRight, Sparkles, TrendingUp, ShoppingBag, Award, Grid3X3, Bell, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar'; // Assuming this component exists and works
import Footer from '@/components/layout/Footer'; // Assuming this component exists and works
import ProductCard from '@/components/products/ProductCard'; // Assuming this component exists and works
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [waitlistData, setWaitlistData] = useState({
    name: '',
    email: '',
    phone: '',
    interest_category: '',
    message: '',
    location: '',
    avatar_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [categoriest, setCategories] = useState([]);

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

  const fetchCategories = async () => {
      const { data, error } = await supabase
      .from('categories')
      .select('*');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  // Placeholder function for search action
  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      console.log('Search query is empty.');
      // Optionally, show a notification to the user
      return;
    }
    console.log('Performing search for:', searchQuery);
    // Implement actual search logic here (e.g., navigate to search results page, filter data)
  };
  
  // Placeholder function for button clicks (navigation, actions)
  const handleNavigate = (destination) => {
    console.log(`Navigating to ${destination}`);
    // Implement actual navigation logic here, e.g., using Next.js router: router.push(destination)
  };

  // Handle waitlist form submission
  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const { data, error } = await supabase
         .from('waitlist')
         .insert([
           {
             name: waitlistData.name,
             email: waitlistData.email,
             phone: waitlistData.phone,
             interest_category: waitlistData.interest_category,
             message: waitlistData.message,
             location: waitlistData.location,
             avatar_url: ''
           }
         ]);

      if (error) {
        throw error;
      }

      setSubmitMessage('Terima kasih! Anda telah berhasil bergabung dengan waitlist kami.');
      setWaitlistData({
         name: '',
         email: '',
         phone: '',
         interest_category: '',
         message: '',
         location: '',
         avatar_url: ''
       });
    } catch (error) {
      console.error('Error submitting waitlist:', error);
      setSubmitMessage('Terjadi kesalahan. Silakan coba lagi nanti.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <Badge variant="outline" className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300">
            <Sparkles className="w-4 h-4 mr-2" />
            Platform UMKM Terdepan di Bekasi
            <ArrowRight className="w-3 h-3 ml-2" />
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-teal-100 bg-clip-text text-transparent leading-tight">
            Temukan & Dukung
            <br />
            <span className="text-yellow-300">UMKM Lokal</span> Bekasi!
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Platform jual beli eksklusif untuk usaha mikro, kecil, dan menengah di Bekasi.
            Bergabunglah dengan komunitas yang mendukung ekonomi lokal.
          </p>
          
          <div className="max-w-2xl mx-auto relative mb-10">
            <div className="relative group">
              <Input
                type="text"
                placeholder="Cari produk, toko, atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-14 pr-32 py-6 text-lg bg-white/95 backdrop-blur-sm text-gray-900 border-0 rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-300 focus:ring-4 focus:ring-white/30"
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              <Button 
                size="sm" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 rounded-xl px-6"
                onClick={handleSearch}
              >
                Cari
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 rounded-xl font-semibold"
              onClick={() => handleNavigate('/products')}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Mulai Belanja
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-blue-600 border-2 border-white/30 hover:text-white hover:bg-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 rounded-xl font-semibold"
              onClick={() => handleNavigate('/sell')}
            >
              <Store className="w-5 h-5 mr-2" />
              Jual Barang Anda
            </Button>
          </div>
          
          <div className="flex justify-center items-center gap-8 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              500+ UMKM Aktif
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              2,500+ Pengguna
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
              Rating 4.8/5
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-50 text-blue-600 hover:bg-blue-100">
              <TrendingUp className="w-4 h-4 mr-2" />
              Statistik Platform
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Dipercaya oleh Ribuan
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600"> Pengguna</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bergabunglah dengan komunitas UMKM terbesar di Bekasi yang terus berkembang
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <Card className="p-8 text-center hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50">
                <CardContent className="p-0">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex items-end justify-center gap-2 mb-2">
                    <h3 className="text-5xl font-bold text-gray-900">500</h3>
                    <span className="text-blue-600 font-semibold mb-2">+</span>
                  </div>
                  <p className="text-gray-600 font-medium">UMKM Terdaftar</p>
                  <div className="mt-4 flex items-center justify-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>+15% bulan ini</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="group">
              <Card className="p-8 text-center hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-teal-50 to-teal-100/50 hover:from-teal-100 hover:to-teal-200/50">
                <CardContent className="p-0">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex items-end justify-center gap-2 mb-2">
                    <h3 className="text-5xl font-bold text-gray-900">2.5</h3>
                    <span className="text-teal-600 font-semibold mb-2">K+</span>
                  </div>
                  <p className="text-gray-600 font-medium">Pengguna Aktif</p>
                  <div className="mt-4 flex items-center justify-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>+23% bulan ini</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="group">
              <Card className="p-8 text-center hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-yellow-50 to-yellow-100/50 hover:from-yellow-100 hover:to-yellow-200/50">
                <CardContent className="p-0">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex items-baseline justify-center gap-1 mb-2"> {/* Changed to items-baseline for better alignment */}
                    <h3 className="text-5xl font-bold text-gray-900">4.8</h3>
                    <Star className="w-6 h-6 text-yellow-500 fill-current" /> {/* Adjusted star size and removed inner div */}
                  </div>
                  <p className="text-gray-600 font-medium">Rating Rata-rata</p>
                  <div className="mt-4 flex items-center justify-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Dari 1,200+ ulasan</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      {/* <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-50 text-teal-600 hover:bg-teal-100">
              <Sparkles className="w-4 h-4 mr-2" />
              Produk Pilihan
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Produk <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Terbaru</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Temukan produk-produk terbaru dari UMKM lokal Bekasi dengan kualitas terbaik
            </p>
            <Button 
              variant="outline" 
              className="border-2 border-teal-200 text-teal-600 hover:bg-teal-50 hover:border-teal-300 px-6 py-3 rounded-xl font-semibold"
              onClick={() => handleNavigate('/products/all')}
            >
              Lihat Semua Produk <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group">
                <ProductCard 
                  product={{
                    id: product.id.toString(), // ProductCard might expect string ID
                    name: product.title,
                    price: product.price,
                    images: [product.image], // Assuming ProductCard expects an array of images
                    seller: product.seller,
                    location: product.location,
                    condition: product.condition,
                    isNew: product.isNew,
                    // These are hardcoded/default values for the demo.
                    // In a real app, these would come from product data or be handled by ProductCard defaults.
                    category_id: "1", 
                    stock: 100,
                    description: `Deskripsi untuk ${product.title}`, // Added a placeholder description
                    rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Random rating between 3.5-5.0 for demo
                    sold: Math.floor(Math.random() * 50) // Random sold count for demo
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Popular Categories */}
      <section className="py-20 px-4 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-50 text-blue-600 hover:bg-blue-100">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Kategori Terlengkap
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kategori <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Populer</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Jelajahi berbagai kategori produk dari UMKM lokal Bekasi dengan pilihan terlengkap
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Card 
                key={category.name || index} // Use category.name if unique, otherwise index for static lists
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-purple-50"
                onClick={() => handleNavigate(`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6 text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 filter group-hover:drop-shadow-lg">{category.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">{category.count} produk</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured UMKM */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-50 text-green-600 hover:bg-green-100">
              <Award className="w-4 h-4 mr-2" />
              UMKM Terpercaya
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              UMKM <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">Unggulan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Kenali lebih dekat dengan para pelaku UMKM terbaik di Bekasi yang telah terpercaya
            </p>
            <Button 
              variant="outline" 
              className="border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 px-6 py-3 rounded-xl font-semibold"
              onClick={() => handleNavigate('/umkm/all')}
            >
              Lihat Semua UMKM <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredUMKM.map((umkm, index) => (
              <Card 
                key={umkm.name || index} // Use umkm.name if unique
                className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-white hover:to-green-50"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                      {umkm.name.charAt(0)}
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">{umkm.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{umkm.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{umkm.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      {umkm.products} produk
                    </span>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => handleNavigate(`/umkm/${umkm.name.toLowerCase().replace(/\s+/g, '-')}`)}
                    >
                      Kunjungi Toko
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-white to-teal-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Bergabung dengan Komunitas Bekasi Local Market
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Dapatkan notifikasi pertama tentang produk terbaru, promo eksklusif, dan event menarik dari UMKM lokal Bekasi.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
              <form onSubmit={handleWaitlistSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="waitlist-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      id="waitlist-name"
                      type="text"
                      value={waitlistData.name}
                      onChange={(e) => setWaitlistData({...waitlistData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="waitlist-phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor WhatsApp
                    </label>
                    <input
                      id="waitlist-phone"
                      type="tel"
                      value={waitlistData.phone}
                      onChange={(e) => setWaitlistData({...waitlistData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="waitlist-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    value={waitlistData.email}
                    onChange={(e) => setWaitlistData({...waitlistData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="waitlist-interest" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori yang Diminati
                  </label>
                  <select
                    id="waitlist-interest"
                    value={waitlistData.interest_category}
                    onChange={(e) => setWaitlistData({...waitlistData, interest_category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Pilih kategori yang diminati</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category.name.toLowerCase().replace(/\s+/g, '_')}>
                        {category.name}
                      </option>
                    ))}
                    <option value="semua">Semua Kategori</option>
                  </select>
                </div>
                
                <div>
                   <label htmlFor="waitlist-location" className="block text-sm font-medium text-gray-700 mb-2">
                     Lokasi (Area Bekasi)
                   </label>
                   <select
                     id="waitlist-location"
                     value={waitlistData.location}
                     onChange={(e) => setWaitlistData({...waitlistData, location: e.target.value})}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                     required
                   >
                     <option value="">Pilih area Bekasi</option>
                     <option value="Bekasi Barat">Bekasi Barat</option>
                     <option value="Bekasi Timur">Bekasi Timur</option>
                     <option value="Bekasi Utara">Bekasi Utara</option>
                     <option value="Bekasi Selatan">Bekasi Selatan</option>
                     <option value="Rawalumbu">Rawalumbu</option>
                     <option value="Bantargebang">Bantargebang</option>
                     <option value="Pondokgede">Pondokgede</option>
                     <option value="Jatiasih">Jatiasih</option>
                     <option value="Jatisampurna">Jatisampurna</option>
                     <option value="Mustikajaya">Mustikajaya</option>
                     <option value="Pondokmelati">Pondokmelati</option>
                     <option value="Medansatria">Medansatria</option>
                   </select>
                 </div>
                 
                 
                 <div>
                   <label htmlFor="waitlist-message" className="block text-sm font-medium text-gray-700 mb-2">
                     Pesan (Opsional)
                   </label>
                   <textarea
                     id="waitlist-message"
                     value={waitlistData.message}
                     onChange={(e) => setWaitlistData({...waitlistData, message: e.target.value})}
                     rows={3}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                     placeholder="Ceritakan tentang harapan Anda terhadap platform ini..."
                   />
                 </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Mendaftar...
                    </div>
                  ) : (
                    'Bergabung Sekarang'
                  )}
                </Button>
              </form>
              
              {submitMessage && (
                <div className={`mt-6 p-4 rounded-lg ${submitMessage.includes('berhasil') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  <p className="font-medium">{submitMessage}</p>
                </div>
              )}
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white mb-4">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Notifikasi Eksklusif</h3>
                <p className="text-gray-600 text-sm">Dapatkan info terbaru tentang produk dan promo menarik</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Komunitas Aktif</h3>
                <p className="text-gray-600 text-sm">Bergabung dengan ribuan pembeli dan penjual lokal</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white mb-4">
                  <Gift className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Benefit Khusus</h3>
                <p className="text-gray-600 text-sm">Akses early bird dan diskon khusus member</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;