import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  User, 
  Package,
  Clock,
  CheckCheck,
  Check
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
  } | null;
  buyer: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  seller: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  message_type: string;
  created_at: string;
  sender: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user || !chatId) return;

    fetchChat();
    fetchMessages();
    markMessagesAsRead();

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Fetch the sender info
          fetchMessageWithSender(newMessage.id);
          // Mark as read if not sent by current user
          if (newMessage.sender_id !== user.id) {
            markMessageAsRead(newMessage.id);
          }
        }
      )
      .subscribe();

    // Subscribe to message updates (read status)
    const messageUpdatesSubscription = supabase
      .channel(`message_updates:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id 
                ? { ...msg, is_read: updatedMessage.is_read }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      messageUpdatesSubscription.unsubscribe();
    };
  }, [user, chatId]);

  const fetchChat = async () => {
    if (!chatId) return;

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
        .eq('id', chatId)
        .single();

      if (error) throw error;
      
      // Handle potential SelectQueryError for related data
      const chatData = {
        ...data,
        products: data.products && typeof data.products === 'object' && !('error' in data.products) ? data.products : null,
        buyer: data?.buyer && typeof data.buyer === 'object' && !('error' in data.buyer) ? data.buyer : null,
        seller: data?.seller && typeof data.seller === 'object' && !('error' in data.seller) ? data.seller : null,
      };
      
      setChat(chatData);
    } catch (error) {
      console.error('Error fetching chat:', error);
      toast.error('Gagal memuat chat');
      navigate('/chats');
    }
  };

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Gagal memuat pesan');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageWithSender = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;
      
      // Check if message already exists to prevent duplicates
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === data.id);
        if (messageExists) {
          return prev;
        }
        return [...prev, data];
      });
    } catch (error) {
      console.error('Error fetching new message:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !chatId) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      // Update unread count in chat
      const isUserBuyer = chat?.buyer_id === user.id;
      const updateField = isUserBuyer ? 'buyer_unread_count' : 'seller_unread_count';
      
      await supabase
        .from('chats')
        .update({ [updateField]: 0 })
        .eq('id', chatId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !chatId || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX
    
    try {
      // Insert message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: messageContent,
          message_type: 'text',
          is_read: false
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Immediately add the message to local state with sender info
      const newMessageWithSender: Message = {
        ...messageData,
        sender: {
          id: user.id,
          name: user.name || '',
          avatar_url: user.avatar_url || null
        }
      };
      
      setMessages(prev => [...prev, newMessageWithSender]);

      // Update chat's last message
      await supabase
        .from('chats')
        .update({
          last_message: messageContent,
          last_message_at: new Date().toISOString(),
          // Increment unread count for the other user
          ...(chat?.buyer_id === user.id 
            ? { seller_unread_count: (chat.seller_unread_count || 0) + 1 }
            : { buyer_unread_count: (chat.buyer_unread_count || 0) + 1 }
          )
        })
        .eq('id', chatId);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Gagal mengirim pesan');
      // Restore message content if there was an error
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hari ini';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const getOtherUser = () => {
    if (!chat || !user) return null;
    return chat.buyer_id === user.id ? chat.seller : chat.buyer;
  };

  const otherUser = getOtherUser();

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

  if (!chat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chat tidak ditemukan</h2>
            <p className="text-gray-600 mb-4">Chat yang Anda cari tidak ada atau telah dihapus.</p>
            <Button onClick={() => navigate('/chats')}>
              Kembali ke Daftar Chat
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/chats')}
                  className="p-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={otherUser?.avatar_url || ''} />
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h1 className="font-semibold text-lg">{otherUser?.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>{chat.products?.name || 'Produk tidak tersedia'}</span>
                      {chat.products?.price && (
                        <Badge variant="secondary">
                          Rp {chat.products.price.toLocaleString('id-ID')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Messages */}
          <Card className="flex flex-col h-[600px]">
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.sender_id === user?.id;
                    const showDate = index === 0 || 
                      formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <Badge variant="outline" className="text-xs">
                              {formatDate(message.created_at)}
                            </Badge>
                          </div>
                        )}
                        
                        <div className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          {!isCurrentUser && (
                            <Avatar className="w-8 h-8 mt-1">
                              <AvatarImage src={message.sender.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {message.sender.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`max-w-[70%] ${isCurrentUser ? 'order-first' : ''}`}>
                            <div className={`rounded-lg px-4 py-2 ${
                              isCurrentUser 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-white border'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                            
                            <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                              isCurrentUser ? 'justify-end' : 'justify-start'
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(message.created_at)}</span>
                              {isCurrentUser && (
                                <div className="ml-1">
                                  {message.is_read ? (
                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {isCurrentUser && (
                            <Avatar className="w-8 h-8 mt-1">
                              <AvatarImage src={user?.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {user?.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            
            <Separator />
            
            {/* Message Input */}
            <div className="p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan..."
                  className="flex-1"
                  disabled={sending}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || sending}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Chat;