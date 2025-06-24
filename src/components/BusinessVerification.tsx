import React, { useState, useEffect } from 'react';
import { Upload, FileText, Camera, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface VerificationData {
  id?: string;
  business_address: string;
  business_description: string;
  business_image_url: string;
  business_name: string;
  business_photo_url: string;
  business_type: string;
  ktp_image_url: string;
  ktp_number: string;
  rejected_reason: string | null;
  submitted_at: string | null;
  updated_at: string;
  user_id: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at: string | null;
  // Legacy field names for backward compatibility
  status?: 'pending' | 'approved' | 'rejected';
  business_registration_number?: string | null;
  notes?: string | null;
  admin_notes?: string | null;
  reviewed_at?: string | null;
}

const BusinessVerification: React.FC = () => {
  const { user } = useAuth();
  const [verificationData, setVerificationData] = useState<VerificationData>({
    business_address: '',
    business_description: '',
    business_image_url: '',
    business_name: '',
    business_photo_url: '',
    business_type: '',
    ktp_image_url: '',
    ktp_number: '',
    rejected_reason: null,
    submitted_at: null,
    updated_at: '',
    user_id: '',
    verification_status: 'pending',
    verified_at: null,
    // Legacy fields for backward compatibility
    status: 'pending',
    business_registration_number: null,
    notes: null,
    admin_notes: null,
    reviewed_at: null
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [businessFile, setBusinessFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [businessPreview, setBusinessPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadVerificationData();
    }
  }, [user]);

  const loadVerificationData = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('business_verification')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        // Map database fields to frontend interface
        const mappedData = {
          ...data,
          // Add legacy field mappings for backward compatibility
          status: data.verification_status as 'pending' | 'approved' | 'rejected',
          business_registration_number: data.business_name, // or create a separate field if needed
          notes: data.business_description,
          admin_notes: data.rejected_reason,
          reviewed_at: data.verified_at
        };
        setVerificationData(mappedData as VerificationData);
        setKtpPreview(data.ktp_image_url);
        setBusinessPreview(data.business_image_url);
      }
    } catch (error) {
      console.error('Error loading verification data:', error);
      toast.error('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File, type: 'ktp' | 'business') => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      if (type === 'ktp') {
        setKtpFile(file);
        setKtpPreview(preview);
      } else {
        setBusinessFile(file);
        setBusinessPreview(preview);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${path}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ktpFile && !verificationData.ktp_image_url) {
      toast.error('Please upload your KTP image');
      return;
    }
    
    if (!businessFile && !verificationData.business_image_url) {
      toast.error('Please upload your business photo');
      return;
    }
    
    if (!verificationData.business_address.trim()) {
      toast.error('Please enter your business address');
      return;
    }

    setSubmitting(true);
    
    try {
      let ktpImageUrl = verificationData.ktp_image_url;
      let businessImageUrl = verificationData.business_image_url;

      // Upload new images if selected
      if (ktpFile) {
        ktpImageUrl = await uploadImage(ktpFile, 'ktp');
      }
      
      if (businessFile) {
        businessImageUrl = await uploadImage(businessFile, 'business');
      }

      const verificationPayload = {
        user_id: user?.id,
        verification_status: 'pending' as const,
        ktp_image_url: ktpImageUrl,
        business_image_url: businessImageUrl,
        business_address: verificationData.business_address,
        business_name: verificationData.business_name || '',
        business_description: verificationData.business_description || '',
        business_type: verificationData.business_type || '',
        ktp_number: verificationData.ktp_number || '',
        submitted_at: new Date().toISOString()
      };

      if (verificationData.id) {
        // Update existing verification
        const { error } = await supabase
          .from('business_verification')
          .update(verificationPayload)
          .eq('id', verificationData.id);
        
        if (error) throw error;
      } else {
        // Create new verification
        const { data, error } = await supabase
          .from('business_verification')
          .insert({
            ...verificationPayload,
            business_photo_url: verificationPayload.business_image_url
          })
          .select()
          .single();
        
        if (error) throw error;
        setVerificationData(prev => ({ ...prev, id: data.id }));
      }

      toast.success('Verification documents submitted successfully');
      loadVerificationData();
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification documents');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
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

  const canEdit = !verificationData.id || verificationData.verification_status === 'rejected';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-blue-500" />
                <h1 className="text-2xl font-bold text-gray-900">Business Verification</h1>
              </div>
              
              {verificationData.id && (
                <div className="flex items-center space-x-2">
                  {getStatusIcon(verificationData.verification_status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verificationData.verification_status)}`}>
                    {verificationData.verification_status.charAt(0).toUpperCase() + verificationData.verification_status.slice(1)}
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mt-2">
              Upload your KTP and business photo to get verified and build trust with customers.
            </p>
          </div>

          <div className="p-6">
            {/* Status Information */}
            {verificationData.id && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Verification Status</h3>
                <div className="space-y-2 text-sm">
                  {verificationData.submitted_at && (
                    <p className="text-gray-600">
                      <span className="font-medium">Submitted:</span>{' '}
                      {new Date(verificationData.submitted_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  {verificationData.verified_at && (
                    <p className="text-gray-600">
                      <span className="font-medium">Reviewed:</span>{' '}
                      {new Date(verificationData.verified_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  {verificationData.rejected_reason && (
                    <div>
                      <span className="font-medium text-gray-700">Admin Notes:</span>
                      <p className="text-gray-600 mt-1">{verificationData.rejected_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* KTP Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  KTP (Kartu Tanda Penduduk) *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {ktpPreview ? (
                    <div className="space-y-4">
                      <img
                        src={ktpPreview}
                        alt="KTP Preview"
                        className="max-w-full h-48 object-contain mx-auto rounded-lg"
                      />
                      {canEdit && (
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'ktp')}
                            className="hidden"
                            id="ktp-upload"
                          />
                          <label
                            htmlFor="ktp-upload"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Change KTP Image
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload your KTP image</p>
                      <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'ktp')}
                        className="hidden"
                        id="ktp-upload"
                      />
                      <label
                        htmlFor="ktp-upload"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Select KTP Image
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Camera className="w-4 h-4 inline mr-1" />
                  Business Photo *
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Upload a photo of your business (storefront, workspace, or products)
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {businessPreview ? (
                    <div className="space-y-4">
                      <img
                        src={businessPreview}
                        alt="Business Preview"
                        className="max-w-full h-48 object-contain mx-auto rounded-lg"
                      />
                      {canEdit && (
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'business')}
                            className="hidden"
                            id="business-upload"
                          />
                          <label
                            htmlFor="business-upload"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Change Business Photo
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload your business photo</p>
                      <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'business')}
                        className="hidden"
                        id="business-upload"
                      />
                      <label
                        htmlFor="business-upload"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Select Business Photo
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address *
                </label>
                <textarea
                  value={verificationData.business_address}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, business_address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your complete business address"
                  disabled={!canEdit}
                  required
                />
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={verificationData.business_name}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, business_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your business name"
                  disabled={!canEdit}
                  required
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type *
                </label>
                <select
                  value={verificationData.business_type}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, business_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!canEdit}
                  required
                >
                  <option value="">Select business type</option>
                  <option value="retail">Retail</option>
                  <option value="food">Food & Beverage</option>
                  <option value="service">Service</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Business Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Description *
                </label>
                <textarea
                  value={verificationData.business_description}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, business_description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your business activities"
                  disabled={!canEdit}
                  required
                />
              </div>

              {/* KTP Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KTP Number *
                </label>
                <input
                  type="text"
                  value={verificationData.ktp_number}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, ktp_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your KTP number"
                  disabled={!canEdit}
                  required
                />
              </div>

              {/* Submit Button */}
              {canEdit && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {verificationData.id ? 'Resubmit Verification' : 'Submit for Verification'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* Information Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Verification Process</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your documents will be reviewed within 1-3 business days</li>
                <li>• Make sure your KTP is clear and readable</li>
                <li>• Business photo should clearly show your business activity</li>
                <li>• Verified businesses get a verification badge and higher visibility</li>
                <li>• You'll be notified via email once the review is complete</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessVerification;