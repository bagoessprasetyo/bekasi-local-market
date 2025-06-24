import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Star, MessageCircle, Eye } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface PurchaseOrder {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  notes: string | null;
  product: {
    id: string;
    name: string;
    images: string[];
    seller: {
      id: string;
      name: string;
      business_name: string | null;
    };
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
}

const PurchaseHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchPurchaseHistory();
    }
  }, [user]);

  const fetchPurchaseHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_amount,
          delivery_address,
          notes,
          product:products (
            id,
            name,
            images,
            seller:users!products_seller_id_fkey (
              id,
              name,
              business_name
            )
          ),
          review:reviews (
            id,
            rating,
            comment
          )
        `)
        .eq('buyer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as unknown as PurchaseOrder[]) || []);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      toast.error('Failed to load purchase history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-6 h-6 text-blue-500" />
                <h1 className="text-2xl font-bold text-gray-900">Purchase History</h1>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  {orders.length} orders
                </span>
              </div>

              <div className="flex space-x-2">
                {['all', 'pending', 'confirmed', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter === status
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {filter === 'all'
                    ? 'Start shopping to see your purchase history here'
                    : `You don't have any ${filter} orders`}
                </p>
                {filter === 'all' && (
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Start Shopping
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {order.product.images && order.product.images.length > 0 ? (
                          <img
                            src={order.product.images[0]}
                            alt={order.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {order.product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Sold by {order.product.seller.business_name || order.product.seller.name}
                            </p>
                            <p className="text-xl font-bold text-blue-600 mt-2">
                              {formatPrice(order.total_amount)}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            {getStatusIcon(order.status)}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Order ID:</span> {order.id.slice(0, 8)}...
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Order Date:</span>{' '}
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Delivery Address:</span> {order.delivery_address}
                          </div>
                          {order.notes && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {order.notes}
                            </div>
                          )}
                        </div>

                        {order.review && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-700">Your Review:</span>
                              <div className="flex space-x-1">
                                {renderStars(order.review.rating)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{order.review.comment}</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
                          <Link
                            to={`/product/${order.product.id}`}
                            className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Product
                          </Link>
                          
                          <Link
                            to={`/chat/${order.product.seller.id}`}
                            className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Contact Seller
                          </Link>

                          {order.status === 'delivered' && !order.review && (
                            <Link
                              to={`/review/${order.id}`}
                              className="inline-flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Write Review
                            </Link>
                          )}
                        </div>
                      </div>
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

export default PurchaseHistory;