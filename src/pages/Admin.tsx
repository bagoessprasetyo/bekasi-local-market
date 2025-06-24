import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Package, BarChart3, Shield, MessageSquare } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { ProductModeration } from '@/components/admin/ProductModeration';
import { AdminStats } from '@/components/admin/AdminStats';
import { ChatbotAnalytics } from '@/components/admin/ChatbotAnalytics';
import { toast } from 'sonner';

const Admin = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');

  // Check if user is admin
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    toast.error('Akses ditolak. Anda tidak memiliki izin admin.');
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Kelola pengguna dan moderasi konten platform</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistik
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pengguna
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produk
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chatbot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <AdminStats />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="products">
          <ProductModeration />
        </TabsContent>

        <TabsContent value="chatbot">
          <ChatbotAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;