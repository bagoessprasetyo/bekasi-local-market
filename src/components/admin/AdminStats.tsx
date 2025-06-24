import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, MessageSquare, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalChats: number;
  activeProducts: number;
  newUsersThisMonth: number;
  newProductsThisMonth: number;
}

export const AdminStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducts: 0,
    totalChats: 0,
    activeProducts: 0,
    newUsersThisMonth: 0,
    newProductsThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get current month start date
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      const monthStart = currentMonth.toISOString();

      // Fetch all stats in parallel
      const [usersResult, productsResult, chatsResult, activeProductsResult, newUsersResult, newProductsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('chats').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
        supabase.from('products').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalChats: chatsResult.count || 0,
        activeProducts: activeProductsResult.count || 0,
        newUsersThisMonth: newUsersResult.count || 0,
        newProductsThisMonth: newProductsResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Pengguna',
      value: stats.totalUsers,
      description: `+${stats.newUsersThisMonth} bulan ini`,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Total Produk',
      value: stats.totalProducts,
      description: `+${stats.newProductsThisMonth} bulan ini`,
      icon: Package,
      color: 'text-green-600',
    },
    {
      title: 'Produk Aktif',
      value: stats.activeProducts,
      description: `${Math.round((stats.activeProducts / stats.totalProducts) * 100) || 0}% dari total`,
      icon: TrendingUp,
      color: 'text-orange-600',
    },
    {
      title: 'Total Chat',
      value: stats.totalChats,
      description: 'Percakapan aktif',
      icon: MessageSquare,
      color: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Platform</CardTitle>
          <CardDescription>
            Statistik keseluruhan platform Bekasi Local Market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tingkat Aktivitas Produk</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((stats.activeProducts / stats.totalProducts) * 100) || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.round((stats.activeProducts / stats.totalProducts) * 100) || 0}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.newUsersThisMonth}</div>
                <div className="text-sm text-muted-foreground">Pengguna Baru Bulan Ini</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.newProductsThisMonth}</div>
                <div className="text-sm text-muted-foreground">Produk Baru Bulan Ini</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};