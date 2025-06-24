
import { MapPin, Star, Badge } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  seller: string;
  location: string;
  condition: string;
  isNew?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
      <div className="relative">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isNew && (
          <div className="absolute top-2 left-2">
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              BARU
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            product.condition === 'Baru' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {product.condition}
          </span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        
        <div className="text-xl font-bold text-blue-600 mb-3">
          {formatPrice(product.price)}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Badge className="w-3 h-3 mr-2 text-orange-500" />
            <span className="hover:text-blue-600 cursor-pointer">{product.seller}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-3 h-3 mr-2" />
            <span>{product.location}</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          Lihat Detail
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
