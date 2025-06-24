
import { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, User, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Removed Tabs import as we no longer distinguish between buyer/seller
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Register = () => {
  // Removed userType state as all users can both buy and sell
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUpWithEmail, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak sama');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);
    
    try {
      const userData = {
        full_name: formData.fullName
      };

      const { error } = await signUpWithEmail(formData.email, formData.password, userData);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
        } else if (error.message.includes('Password should be at least')) {
          toast.error('Password terlalu lemah');
        } else {
          toast.error(error.message || 'Terjadi kesalahan saat mendaftar');
        }
      } else {
        toast.success('Pendaftaran berhasil! Silakan cek email untuk verifikasi.');
        navigate('/login');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan yang tidak terduga');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // Note: redirect will be handled by OAuth flow
    } catch (error: any) {
      toast.error(error.message || 'Gagal mendaftar dengan Google');
    }
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
            {/* Google Register Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 mb-4"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Daftar dengan Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Atau</span>
              </div>
            </div>

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
