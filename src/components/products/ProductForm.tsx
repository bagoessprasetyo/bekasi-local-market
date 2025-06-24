import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Sparkles, Brain, DollarSign, Eye, Loader2 } from 'lucide-react';
import { 
  suggestCategory, 
  generateDescription, 
  suggestPricing, 
  analyzeImage, 
  isAIAvailable,
  CategorySuggestion,
  DescriptionSuggestion,
  PricingSuggestion,
  ImageAnalysis
} from '@/utils/aiHelpers';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
}

const ProductForm = ({ productId, onSuccess }: ProductFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  // AI-related state
  const [aiLoading, setAiLoading] = useState({
    category: false,
    description: false,
    pricing: false,
    imageAnalysis: false
  });
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);
  const [descriptionSuggestion, setDescriptionSuggestion] = useState<DescriptionSuggestion | null>(null);
  const [pricingSuggestion, setPricingSuggestion] = useState<PricingSuggestion | null>(null);
  const [imageAnalyses, setImageAnalyses] = useState<ImageAnalysis[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    condition: 'new',
    status: 'available'
  });

  useEffect(() => {
    fetchCategories();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Gagal memuat kategori');
    }
  };

  const fetchProduct = async () => {
    if (!productId) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      setFormData({
        name: data.name || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        category_id: data.category_id || '',
        stock: data.stock?.toString() || '',
        condition: data.condition || 'new',
        status: data.status || 'available'
      });
      
      if (data.images && Array.isArray(data.images)) {
        setImageUrls(data.images);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Gagal memuat data produk');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
      toast.error('Maksimal 3 gambar');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return imageUrls;
    
    setUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, image);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
      }
      
      return [...imageUrls, ...uploadedUrls];
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Gagal mengupload gambar');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // AI Helper Functions
  const handleCategorySuggestion = async () => {
    if (!formData.name.trim()) {
      toast.error('Masukkan nama produk terlebih dahulu');
      return;
    }

    setAiLoading(prev => ({ ...prev, category: true }));
    try {
      const suggestions = await suggestCategory(formData.name, formData.description);
      setCategorySuggestions(suggestions);
      if (suggestions.length > 0) {
        toast.success(`Ditemukan ${suggestions.length} saran kategori`);
      }
    } catch (error) {
      toast.error('Gagal mendapatkan saran kategori');
    } finally {
      setAiLoading(prev => ({ ...prev, category: false }));
    }
  };

  const handleDescriptionGeneration = async () => {
    if (!formData.name.trim() || !formData.category_id) {
      toast.error('Masukkan nama produk dan pilih kategori terlebih dahulu');
      return;
    }

    setAiLoading(prev => ({ ...prev, description: true }));
    try {
      const categoryName = categories.find(c => c.id === formData.category_id)?.name || '';
      const suggestion = await generateDescription(formData.name, categoryName);
      if (suggestion) {
        setDescriptionSuggestion(suggestion);
        toast.success('Deskripsi berhasil dibuat!');
      }
    } catch (error) {
      toast.error('Gagal membuat deskripsi');
    } finally {
      setAiLoading(prev => ({ ...prev, description: false }));
    }
  };

  const handlePricingSuggestion = async () => {
    if (!formData.name.trim() || !formData.category_id) {
      toast.error('Masukkan nama produk dan pilih kategori terlebih dahulu');
      return;
    }

    setAiLoading(prev => ({ ...prev, pricing: true }));
    try {
      const categoryName = categories.find(c => c.id === formData.category_id)?.name || '';
      const suggestion = await suggestPricing(formData.name, categoryName, formData.description);
      if (suggestion) {
        setPricingSuggestion(suggestion);
        toast.success('Saran harga berhasil dibuat!');
      }
    } catch (error) {
      toast.error('Gagal mendapatkan saran harga');
    } finally {
      setAiLoading(prev => ({ ...prev, pricing: false }));
    }
  };

  const handleImageAnalysis = async (imageUrl: string, index: number) => {
    if (!formData.name.trim()) {
      toast.error('Masukkan nama produk terlebih dahulu');
      return;
    }

    setAiLoading(prev => ({ ...prev, imageAnalysis: true }));
    try {
      const analysis = await analyzeImage(imageUrl, formData.name);
      if (analysis) {
        setImageAnalyses(prev => {
          const newAnalyses = [...prev];
          newAnalyses[index] = analysis;
          return newAnalyses;
        });
        toast.success(`Analisis gambar ${index + 1} selesai!`);
      }
    } catch (error) {
      toast.error('Gagal menganalisis gambar');
    } finally {
      setAiLoading(prev => ({ ...prev, imageAnalysis: false }));
    }
  };

  const applyCategorySuggestion = (suggestion: CategorySuggestion) => {
    const category = categories.find(c => c.name === suggestion.category);
    if (category) {
      setFormData(prev => ({ ...prev, category_id: category.id }));
      toast.success(`Kategori "${suggestion.category}" dipilih`);
    }
  };

  const applyDescriptionSuggestion = () => {
    if (descriptionSuggestion) {
      setFormData(prev => ({ ...prev, description: descriptionSuggestion.description }));
      toast.success('Deskripsi diterapkan');
    }
  };

  const applyPricingSuggestion = () => {
    if (pricingSuggestion) {
      setFormData(prev => ({ ...prev, price: pricingSuggestion.suggestedPrice.toString() }));
      toast.success('Harga disarankan diterapkan');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Anda harus login terlebih dahulu');
      return;
    }
    
    if (!formData.name || !formData.description || !formData.price || !formData.category_id) {
      toast.error('Mohon lengkapi semua field yang wajib');
      return;
    }
    
    setLoading(true);
    
    try {
      const uploadedImageUrls = await uploadImages();
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        stock: parseInt(formData.stock) || 0,
        condition: formData.condition,
        status: formData.status,
        images: uploadedImageUrls,
        seller_id: user.id
      };
      
      if (productId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);
        
        if (error) throw error;
        toast.success('Produk berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        toast.success('Produk berhasil ditambahkan');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard/products');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {productId ? 'Edit Produk' : 'Tambah Produk Baru'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Masukkan nama produk"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Deskripsi *</Label>
              {isAIAvailable() && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDescriptionGeneration}
                  // disabled={aiLoading.description || !formData.name.trim() || !formData.category_id}
                  className="text-xs"
                >
                  {aiLoading.description ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Brain className="w-3 h-3 mr-1" />
                  )}
                  Buat dengan AI
                </Button>
              )}
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Deskripsikan produk Anda"
              rows={4}
              required
            />
            
            {/* Description Suggestion */}
            {descriptionSuggestion && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-green-900">Deskripsi yang Disarankan AI:</p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={applyDescriptionSuggestion}
                    className="text-xs"
                  >
                    Gunakan
                  </Button>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm mb-2">{descriptionSuggestion.description}</p>
                  {descriptionSuggestion.keyFeatures.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700">Fitur Utama:</p>
                      <ul className="text-xs text-gray-600 list-disc list-inside">
                        {descriptionSuggestion.keyFeatures.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {descriptionSuggestion.benefits.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700">Manfaat:</p>
                      <ul className="text-xs text-gray-600 list-disc list-inside">
                        {descriptionSuggestion.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="price">Harga (Rp) *</Label>
                {isAIAvailable() && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePricingSuggestion}
                    disabled={aiLoading.pricing || !formData.name.trim() || !formData.category_id}
                    className="text-xs"
                  >
                    {aiLoading.pricing ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <DollarSign className="w-3 h-3 mr-1" />
                    )}
                    Saran Harga
                  </Button>
                )}
              </div>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0"
                required
              />
              
              {/* Pricing Suggestion */}
              {pricingSuggestion && (
                <div className="mt-2 p-3 bg-yellow-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-yellow-900">Saran Harga AI:</p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={applyPricingSuggestion}
                      className="text-xs"
                    >
                      Gunakan
                    </Button>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-gray-600">Harga Disarankan:</p>
                        <p className="font-bold text-lg text-green-600">
                          Rp {pricingSuggestion.suggestedPrice.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Rentang Harga:</p>
                        <p className="text-sm">
                          Rp {pricingSuggestion.priceRange.min.toLocaleString('id-ID')} - 
                          Rp {pricingSuggestion.priceRange.max.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700">Alasan:</p>
                      <p className="text-xs text-gray-600">{pricingSuggestion.reasoning}</p>
                      <p className="text-xs font-medium text-gray-700">Perbandingan Pasar:</p>
                      <p className="text-xs text-gray-600">{pricingSuggestion.marketComparison}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Stok</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category">Kategori *</Label>
                {isAIAvailable() && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCategorySuggestion}
                    disabled={aiLoading.category || !formData.name.trim()}
                    className="text-xs"
                  >
                    {aiLoading.category ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 mr-1" />
                    )}
                    Saran AI
                  </Button>
                )}
              </div>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Category Suggestions */}
              {categorySuggestions.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border">
                  <p className="text-sm font-medium text-blue-900 mb-2">Saran Kategori AI:</p>
                  <div className="space-y-2">
                    {categorySuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{suggestion.category}</p>
                          <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                          <p className="text-xs text-blue-600">Confidence: {(suggestion.confidence * 100).toFixed(0)}%</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => applyCategorySuggestion(suggestion)}
                          className="ml-2"
                        >
                          Pilih
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="condition">Kondisi</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Baru</SelectItem>
                  <SelectItem value="used">Bekas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Tersedia</SelectItem>
                <SelectItem value="sold">Terjual</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Gambar Produk (Maksimal 3)</Label>
              {isAIAvailable() && (images.length > 0 || imageUrls.length > 0) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allImages = [...imageUrls, ...images.map(img => URL.createObjectURL(img))];
                    allImages.forEach((url, index) => handleImageAnalysis(url, index));
                  }}
                  disabled={aiLoading.imageAnalysis}
                  className="text-xs"
                >
                  {aiLoading.imageAnalysis ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Eye className="w-3 h-3 mr-1" />
                  )}
                  Analisis AI
                </Button>
              )}
            </div>
            
            {/* Existing Images */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {/* AI Analysis Badge */}
                    {imageAnalyses[index] && (
                      <div className="absolute bottom-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                        AI ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* New Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {/* AI Analysis Badge */}
                    {imageAnalyses[imageUrls.length + index] && (
                      <div className="absolute bottom-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                        AI ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Button */}
            {(images.length + imageUrls.length) < 3 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Klik untuk upload gambar
                  </span>
                </label>
              </div>
            )}
            
            {/* Image Analysis Results */}
            {imageAnalyses.length > 0 && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border">
                <h4 className="text-sm font-medium text-purple-900 mb-3">Hasil Analisis Gambar AI:</h4>
                <div className="space-y-3">
                  {imageAnalyses.map((analysis, index) => (
                    analysis && (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Gambar {index + 1}</p>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            Kualitas: {analysis.quality}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gray-700">Deskripsi:</p>
                            <p className="text-xs text-gray-600">{analysis.description}</p>
                          </div>
                          {analysis.detectedObjects.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700">Objek Terdeteksi:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {analysis.detectedObjects.map((obj, objIndex) => (
                                  <span key={objIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {obj}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {analysis.suggestions.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700">Saran Perbaikan:</p>
                              <ul className="text-xs text-gray-600 list-disc list-inside">
                                {analysis.suggestions.map((suggestion, suggestionIndex) => (
                                  <li key={suggestionIndex}>{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
              className="flex-1"
            >
              {loading || uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? 'Mengupload...' : 'Menyimpan...'}
                </>
              ) : (
                productId ? 'Perbarui Produk' : 'Tambah Produk'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;