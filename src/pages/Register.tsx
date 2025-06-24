
import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, User, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

const Register = () => {
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    businessName: '',
    whatsappNumber: '',
    businessLocation: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bekasikAreas = [
    'Bekasi Barat',
    'Bekasi Timur',
    'Bekasi Utara',
    'Bekasi Selatan',
    'Bantar Gebang',
    'Bekasi Jaya',
    'Pondok Gede',
    'Jatiasih',
    'Jatisampurna',
    'Medan Satria',
    'Mustika Jaya',
    'Rawalumbu',
    'Tambun Selatan',
    'Tambun Utara',
    'Taruma Jaya'
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement Supabase authentication
    console.log('Registration attempt:', { userType, ...formData });
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-blue-600">BekasiUMKM</h1>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Bergabung dengan Komunitas
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Daftar sekarang dan mulai berbelanja atau berjualan produk UMKM lokal.
            </p>
          </CardHeader>

          <CardContent>
            <Tabs value={userType} onValueChange={(value) => setUserType(value as 'buyer' | 'seller')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="buyer" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Pembeli
                </TabsTrigger>
                <TabsTrigger value="seller" className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Penjual (UMKM)
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Common Fields */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="h-11 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Konfirmasi Password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        required
                        className="h-11 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <TabsContent value="buyer" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="seller" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nama Usaha/Toko</Label>
                    <Input
                      id="businessName"
                      type="text"
                      placeholder="Masukkan nama usaha atau toko"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">Nomor WhatsApp</Label>
                      <Input
                        id="whatsappNumber"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={formData.whatsappNumber}
                        onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                        required
                        className="h-11"
                      />
                      <p className="text-xs text-gray-500">
                        Nomor ini akan digunakan pembeli untuk menghubungi Anda
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessLocation">Lokasi Usaha</Label>
                      <Select 
                        value={formData.businessLocation} 
                        onValueChange={(value) => handleInputChange('businessLocation', value)}
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Pilih lokasi usaha" />
                        </SelectTrigger>
                        <SelectContent>
                          {bekasikAreas.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                    required
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600">
                    Saya setuju dengan{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-700">
                      Syarat & Ketentuan
                    </Link>{' '}
                    dan{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
                      Kebijakan Privasi
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading || !formData.agreeToTerms}
                >
                  {isLoading ? 'Sedang mendaftar...' : 'Daftar Sekarang'}
                </Button>
              </form>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
