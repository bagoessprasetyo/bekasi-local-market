import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  Search, 
  User, 
  Package,
  Clock,
  Plus
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface Chat {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  last_message: string | null;
  last_message_at: string | null;
  buyer_unread_count: number;
  seller_unread_count: number;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
  buyer: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  seller: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchChats();

    // Subscribe to chat updates
    const chatsSubscription = supabase
      .channel('user_chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `or(buyer_id.eq.${user.id},seller_id.eq.${user.id})`,
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    // Subscribe to new messages to update last_message
    const messagesSubscription = supabase
      .channel('user_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      chatsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, [user, navigate]);

  useEffect(() => {
    // Filter chats based on search term
    if (!searchTerm.trim()) {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat => {
        const otherUser = chat.buyer_id === user?.id ? chat.seller : chat.buyer;
        const productName = chat.products.name.toLowerCase();
        const userName = otherUser.name.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return productName.includes(search) || userName.includes(search);
      });
      setFilteredChats(filtered);
    }
  }, [chats, searchTerm, user]);

  const fetchChats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          products:product_id (
            id,
            name,
            price,
            images
          ),
          buyer:buyer_id (
            id,
            name,
            avatar_url
          ),
          seller:seller_id (
            id,
            name,
            avatar_url
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChats((data as unknown as Chat[]) || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Gagal memuat daftar chat');
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessageTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'Baru saja' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}j`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}h`;
      } else {
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short'
        });
      }
    }
  };

  const getOtherUser = (chat: Chat) => {
    return chat.buyer_id === user?.id ? chat.seller : chat.buyer;
  };

  const getUnreadCount = (chat: Chat) => {
    return chat.buyer_id === user?.id ? chat.buyer_unread_count : chat.seller_unread_count;
  };

  const truncateMessage = (message: string | null, maxLength: number = 50) => {
    if (!message) return 'Belum ada pesan';
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat chat...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Chat Saya</h1>
              <Button 
                onClick={() => navigate('/browse')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Mulai Chat Baru
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari chat atau produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Chat List */}
          {filteredChats.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'Tidak ada chat yang ditemukan' : 'Belum ada chat'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? 'Coba gunakan kata kunci yang berbeda' 
                      : 'Mulai chat dengan penjual untuk bertanya tentang produk yang Anda minati'
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => navigate('/browse')}>
                      Jelajahi Produk
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredChats.map((chat) => {
                const otherUser = getOtherUser(chat);
                const unreadCount = getUnreadCount(chat);
                
                return (
                  <Card 
                    key={chat.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/chat/${chat.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={otherUser.avatar_url || ''} />
                          <AvatarFallback>
                            <User className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {otherUser.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {chat.last_message_at && (
                                <span className="text-xs text-gray-500">
                                  {formatLastMessageTime(chat.last_message_at)}
                                </span>
                              )}
                              {unreadCount > 0 && (
                                <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                                  {unreadCount > 99 ? '99+' : unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 truncate">
                              {chat.products.name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              Rp {chat.products.price.toLocaleString('id-ID')}
                            </Badge>
                          </div>
                          
                          {/* Last Message */}
                          <p className={`text-sm truncate ${
                            unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                          }`}>
                            {truncateMessage(chat.last_message)}
                          </p>
                        </div>
                        
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {chat.products.images && chat.products.images.length > 0 ? (
                            <img 
                              src={chat.products.images[0]} 
                              alt={chat.products.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ChatList;