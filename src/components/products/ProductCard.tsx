
import { MapPin, User, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category_id: string;
  stock: number;
  condition: string;
  status: string;
  created_at: string;
  seller_id: string;
  location?: string;
  categories?: {
    name: string;
    icon: string;
  };
  users?: {
    name: string;
    location: string;
  };
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const handleClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden" onClick={handleClick}>
      <div className="relative">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <Badge variant={product.condition === 'new' ? 'default' : 'secondary'}>
            {product.condition === 'new' ? 'Baru' : 'Bekas'}
          </Badge>
        </div>
        
        {product.categories && (
          <div className="absolute top-2 left-2">
            <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
              {product.categories.icon} {product.categories.name}
            </span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        
        <div className="text-xl font-bold text-blue-600 mb-3">
          {formatPrice(product.price)}
        </div>
        
        <div className="space-y-2 mb-4">
          {product.users && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-3 h-3 mr-2" />
              <span className="hover:text-blue-600 cursor-pointer">{product.users.name}</span>
            </div>
          )}
          
          {product.users?.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-3 h-3 mr-2" />
              <span>{product.users.location}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Stok: {product.stock}</span>
            <span>{new Date(product.created_at).toLocaleDateString('id-ID')}</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          Lihat Detail
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
