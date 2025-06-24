import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Phone, Mail, User, Store, Edit2, Save, X, Package, ShoppingBag, Heart, Users, CheckCircle, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';
import Wishlist from '@/components/Wishlist';
import FollowedSellers from '@/components/FollowedSellers';
import PurchaseHistory from '@/components/PurchaseHistory';
import BusinessStorefront from '@/components/BusinessStorefront';
import BusinessVerification from '@/components/BusinessVerification';


type UserProfile = Tables<'users'>;

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [activeSection, setActiveSection] = useState('basic');
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    location: '',
    avatar_url: ''
  });

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
    'Rawalumbu'
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast.error('Gagal memuat profil');
        } else {
          setProfile(data);
          setEditForm({
            name: data.name || '',
            phone: data.phone || '',
            location: data.location || '',
            avatar_url: data.avatar_url || ''
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Terjadi kesalahan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    if (profile) {
      setEditForm({
        name: profile.name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: editForm.name,
          phone: editForm.phone,
          location: editForm.location,
          avatar_url: editForm.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Gagal menyimpan perubahan');
      } else {
        setProfile(data);
        setIsEditing(false);
        toast.success('Profil berhasil diperbarui!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };



  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profil tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Profil
              </CardTitle>
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    size="sm" 
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline" 
                    size="sm"
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batal
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar_url || ''} alt={profile.name} />
                  <AvatarFallback className="text-lg font-semibold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                  <p className="text-gray-600">{profile.email}</p>
                  <Badge 
                    variant="outline" 
                    className="mt-2 bg-blue-100 text-blue-800"
                  >
                    <User className="w-3 h-3" />
                    <span className="ml-1">
                      Pengguna
                    </span>
                  </Badge>
                  {profile.is_verified && (
                    <Badge className="mt-2 ml-2 bg-blue-100 text-blue-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Terverifikasi
                    </Badge>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Masukkan nama lengkap"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile.name || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2 py-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor WhatsApp</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Contoh: 08123456789"
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900">{profile.phone || '-'}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi</Label>
                  {isEditing ? (
                    <Select 
                      value={editForm.location} 
                      onValueChange={(value) => handleInputChange('location', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih area Bekasi" />
                      </SelectTrigger>
                      <SelectContent>
                        {bekasikAreas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900">{profile.location || '-'}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'wishlist':
        return <Wishlist />;
      
      case 'followed':
        return <FollowedSellers />;
      
      case 'history':
        return <PurchaseHistory />;
      
      case 'storefront':
        return <BusinessStorefront />;
      
      case 'verification':
        return <BusinessVerification />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-gray-600 mt-2">Kelola informasi profil dan preferensi akun Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Menu Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeTab === 'profile' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Informasi Profil
                </Button>
                
                <Button
                  variant={activeTab === 'wishlist' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('wishlist')}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </Button>
                <Button
                  variant={activeTab === 'followed' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('followed')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Penjual Diikuti
                </Button>
                
                <Button
                  variant={activeTab === 'history' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('history')}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Riwayat Pembelian
                </Button>
                
                <Button
                  variant={activeTab === 'storefront' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('storefront')}
                >
                  <Store className="w-4 h-4 mr-2" />
                  Toko Saya
                </Button>
                <Button
                  variant={activeTab === 'verification' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('verification')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verifikasi Bisnis
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Informasi Akun</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Bergabung sejak</p>
                  <p className="font-medium">
                    {new Date(profile.created_at || '').toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Terakhir diperbarui</p>
                  <p className="font-medium">
                    {new Date(profile.updated_at || '').toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;