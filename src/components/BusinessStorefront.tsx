import React, { useState, useEffect } from 'react';
import { Store, MapPin, Clock, Phone, Edit3, Save, X, Camera, Star, Package } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface BusinessData {
  business_name: string;
  business_type: string;
  business_description: string;
  business_hours: any;
  location: string;
  phone: string;
  avatar_url: string;
  is_verified: boolean;
  verification_badge: string | null;
}

interface ProductStats {
  total_products: number;
  active_products: number;
  total_orders: number;
  average_rating: number;
}

const BUSINESS_TYPES = [
  'Kuliner',
  'Fashion',
  'Kerajinan',
  'Elektronik',
  'Kecantikan',
  'Kesehatan',
  'Otomotif',
  'Pendidikan',
  'Jasa',
  'Lainnya'
];

const BEKASI_AREAS = [
  'Bekasi Timur',
  'Bekasi Barat',
  'Bekasi Selatan',
  'Bekasi Utara',
  'Medan Satria',
  'Bantar Gebang',
  'Mustika Jaya',
  'Pondok Gede',
  'Jati Asih',
  'Jati Sampurna',
  'Pondok Melati',
  'Rawalumbu'
];

const DEFAULT_BUSINESS_HOURS = {
  monday: '09:00-17:00',
  tuesday: '09:00-17:00',
  wednesday: '09:00-17:00',
  thursday: '09:00-17:00',
  friday: '09:00-17:00',
  saturday: '09:00-17:00',
  sunday: 'Closed'
};

const BusinessStorefront: React.FC = () => {
  const { user, fetchUserProfile } = useAuth();
  const [businessData, setBusinessData] = useState<BusinessData>({
    business_name: '',
    business_type: '',
    business_description: '',
    business_hours: DEFAULT_BUSINESS_HOURS,
    location: '',
    phone: '',
    avatar_url: '',
    is_verified: false,
    verification_badge: null
  });
  const [productStats, setProductStats] = useState<ProductStats>({
    total_products: 0,
    active_products: 0,
    total_orders: 0,
    average_rating: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadBusinessData();
      loadProductStats();
    }
  }, [user]);

  const loadBusinessData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('business_name, business_type, business_description, business_hours, location, phone, avatar_url, is_verified, verification_badge')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setBusinessData({
        business_name: data.business_name || '',
        business_type: data.business_type || '',
        business_description: data.business_description || '',
        business_hours: data.business_hours || DEFAULT_BUSINESS_HOURS,
        location: data.location || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url || '',
        is_verified: data.is_verified || false,
        verification_badge: data.verification_badge
      });
    } catch (error) {
      console.error('Error loading business data:', error);
      toast.error('Failed to load business information');
    } finally {
      setLoading(false);
    }
  };

  const loadProductStats = async () => {
    try {
      // Get product counts
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, status')
        .eq('seller_id', user?.id);

      if (productsError) throw productsError;

      // Get order count
      const { count: orderCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('product_id', products?.map(p => p.id) || []);

      if (ordersError) throw ordersError;

      // Get average rating
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .in('product_id', products?.map(p => p.id) || []);

      if (reviewsError) throw reviewsError;

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      setProductStats({
        total_products: products?.length || 0,
        active_products: products?.filter(p => p.status === 'available').length || 0,
        total_orders: orderCount || 0,
        average_rating: Math.round(averageRating * 10) / 10
      });
    } catch (error) {
      console.error('Error loading product stats:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          business_name: businessData.business_name,
          business_type: businessData.business_type,
          business_description: businessData.business_description,
          business_hours: businessData.business_hours,
          location: businessData.location,
          phone: businessData.phone,
          avatar_url: businessData.avatar_url
        })
        .eq('id', user?.id);

      if (error) throw error;

      await fetchUserProfile();
      setIsEditing(false);
      toast.success('Business information updated successfully');
    } catch (error) {
      console.error('Error saving business data:', error);
      toast.error('Failed to save business information');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadBusinessData();
  };

  const handleInputChange = (field: keyof BusinessData, value: string) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessHoursChange = (day: string, hours: string) => {
    setBusinessData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: hours
      }
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

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
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
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Store className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">Business Storefront</h1>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Storefront
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Business Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Products</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">{productStats.active_products}</p>
              <p className="text-xs text-blue-600">of {productStats.total_products} total</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Orders</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">{productStats.total_orders}</p>
              <p className="text-xs text-green-600">total orders</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">Rating</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{productStats.average_rating}</p>
              <div className="flex space-x-1 mt-1">
                {renderStars(productStats.average_rating)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={`w-5 h-5 rounded-full ${
                  businessData.is_verified ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm font-medium text-purple-600">Status</span>
              </div>
              <p className="text-sm font-bold text-purple-900 mt-1">
                {businessData.is_verified ? 'Verified' : 'Unverified'}
              </p>
              {businessData.verification_badge && (
                <p className="text-xs text-purple-600">{businessData.verification_badge}</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Information</h2>
          
          <div className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                {businessData.avatar_url ? (
                  <img
                    src={businessData.avatar_url}
                    alt="Business Logo"
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {businessData.business_name ? getInitials(businessData.business_name) : <Camera className="w-8 h-8" />}
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={businessData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your business name"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">
                      {businessData.business_name || 'Business name not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  {isEditing ? (
                    <select
                      value={businessData.business_type}
                      onChange={(e) => handleInputChange('business_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select business type</option>
                      {BUSINESS_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {businessData.business_type || 'Business type not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Description
              </label>
              {isEditing ? (
                <textarea
                  value={businessData.business_description}
                  onChange={(e) => handleInputChange('business_description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your business, products, and services..."
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">
                  {businessData.business_description || 'Business description not set'}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                {isEditing ? (
                  <select
                    value={businessData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select location</option>
                    {BEKASI_AREAS.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {businessData.location || 'Location not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={businessData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-900">
                    {businessData.phone || 'Phone number not set'}
                  </p>
                )}
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Clock className="w-4 h-4 inline mr-1" />
                Business Hours
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(businessData.business_hours || DEFAULT_BUSINESS_HOURS).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-3">
                    <span className="w-20 text-sm font-medium text-gray-700 capitalize">
                      {day}:
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={hours as string}
                        onChange={(e) => handleBusinessHoursChange(day, e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="09:00-17:00 or Closed"
                      />
                    ) : (
                      <span className="text-gray-900 text-sm">{hours as string}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/add-product"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-600">Add New Product</span>
              </div>
            </Link>
            
            <Link
              to="/business-verification"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {businessData.is_verified ? 'Verification Status' : 'Get Verified'}
                </span>
              </div>
            </Link>
            
            <Link
              to="/products"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <div className="text-center">
                <Store className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-600">Manage Products</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessStorefront;