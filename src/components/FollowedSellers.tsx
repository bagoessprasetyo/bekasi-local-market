import React, { useState, useEffect } from 'react';
import { Users, UserMinus, Store, MapPin, Clock, Eye } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface FollowedSeller {
  id: string;
  created_at: string;
  seller: {
    id: string;
    name: string;
    avatar_url: string | null;
    location: string;
    business_name: string | null;
    business_type: string | null;
    business_hours: any;
    is_verified: boolean;
    verification_badge: string | null;
    _count?: {
      products: number;
    };
  };
}

const FollowedSellers: React.FC = () => {
  const { user } = useAuth();
  const [followedSellers, setFollowedSellers] = useState<FollowedSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFollowedSellers();
    }
  }, [user]);

  const fetchFollowedSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('followed_sellers')
        .select(`
          id,
          created_at,
          seller:users!followed_sellers_seller_id_fkey (
            id,
            name,
            avatar_url,
            location,
            business_name,
            business_type,
            business_hours,
            is_verified,
            verification_badge
          )
        `)
        .eq('follower_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get product count for each seller
      const sellersWithCounts = await Promise.all(
        (data || []).map(async (item) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', item.seller.id)
            .eq('status', 'available');

          return {
            ...item,
            seller: {
              ...item.seller,
              _count: { products: count || 0 }
            }
          };
        })
      );

      setFollowedSellers(sellersWithCounts);
    } catch (error) {
      console.error('Error fetching followed sellers:', error);
      toast.error('Failed to load followed sellers');
    } finally {
      setLoading(false);
    }
  };

  const unfollowSeller = async (followId: string, sellerName: string) => {
    try {
      const { error } = await supabase
        .from('followed_sellers')
        .delete()
        .eq('id', followId);

      if (error) throw error;

      setFollowedSellers(prev => prev.filter(item => item.id !== followId));
      toast.success(`Unfollowed ${sellerName}`);
    } catch (error) {
      console.error('Error unfollowing seller:', error);
      toast.error('Failed to unfollow seller');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatBusinessHours = (businessHours: any) => {
    if (!businessHours) return 'Hours not specified';
    
    if (typeof businessHours === 'string') {
      return businessHours;
    }
    
    if (typeof businessHours === 'object') {
      // Assuming format like { "monday": "09:00-17:00", ... }
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase().slice(0, 3); // mon, tue, etc.
      const todayHours = businessHours[today] || businessHours[Object.keys(businessHours)[0]];
      return todayHours || 'Closed today';
    }
    
    return 'Hours not specified';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">Followed Sellers</h1>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                {followedSellers.length} sellers
              </span>
            </div>
          </div>

          <div className="p-6">
            {followedSellers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  You're not following any sellers yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Follow your favorite sellers to stay updated with their latest products
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Store className="w-4 h-4 mr-2" />
                  Discover Sellers
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {followedSellers.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {item.seller.avatar_url ? (
                          <img
                            src={item.seller.avatar_url}
                            alt={item.seller.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                            {getInitials(item.seller.name)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item.seller.business_name || item.seller.name}
                          </h3>
                          {item.seller.is_verified && (
                            <div className="flex items-center space-x-1">
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              {item.seller.verification_badge && (
                                <span className="text-xs text-blue-600 font-medium">
                                  {item.seller.verification_badge}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          {item.seller.name}
                        </p>

                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{item.seller.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Store className="w-4 h-4" />
                            <span>{item.seller._count?.products || 0} products</span>
                          </div>
                        </div>

                        {item.seller.business_type && (
                          <div className="mt-2">
                            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                              {item.seller.business_type}
                            </span>
                          </div>
                        )}

                        {item.seller.business_hours && (
                          <div className="flex items-center space-x-1 mt-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{formatBusinessHours(item.seller.business_hours)}</span>
                          </div>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                          Following since {new Date(item.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <Link
                        to={`/seller/${item.seller.id}`}
                        className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Store
                      </Link>
                      <button
                        onClick={() => unfollowSeller(item.id, item.seller.business_name || item.seller.name)}
                        className="inline-flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <UserMinus className="w-4 h-4 mr-1" />
                        Unfollow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowedSellers;