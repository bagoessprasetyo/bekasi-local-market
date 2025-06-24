import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Eye } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface WishlistItem {
  id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    seller: {
      name: string;
      location: string;
    };
    status: string;
  };
}

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    }
  }, [user]);

  const fetchWishlistItems = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          created_at,
          product:products (
            id,
            name,
            price,
            images,
            status,
            seller:users!products_seller_id_fkey (
              name,
              location
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
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
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                {wishlistItems.length} items
              </span>
            </div>
          </div>

          <div className="p-6">
            {wishlistItems.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-gray-500 mb-6">
                  Start adding products you love to your wishlist
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCart className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xl font-bold text-blue-600 mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>By {item.product.seller.name}</span>
                        <span>•</span>
                        <span>{item.product.seller.location}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.product.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.product.status === 'available' ? 'Available' : 'Sold'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Added {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Product"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-5 h-5" />
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

export default Wishlist;