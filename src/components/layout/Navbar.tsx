
import { useState } from 'react';
import { Search, Menu, X, User, Store, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  
  // For now, we'll default to 'buyer' role - this could be enhanced to read from user profile
  const userType = 'buyer'; // This would come from user profile in a real app

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">BekasiUMKM</h1>
            </div>
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/">
                <h1 className="text-2xl font-bold text-blue-600">BekasiUMKM</h1>
              </Link>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Cari produk di Bekasi..."
                className="pl-10 pr-4 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
              Jelajahi
            </Button>
            <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
              Tentang Kami
            </Button>

            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    Masuk
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Daftar
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Jual Barang
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {userType === 'buyer' ? (
                      <>
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Akun Saya
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Chat Saya
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem>
                          <Store className="mr-2 h-4 w-4" />
                          Toko Saya
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Produk Saya
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Chat Saya
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Cari produk di Bekasi..."
              className="pl-10 pr-4 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-blue-600">
                Jelajahi
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-blue-600">
                Tentang Kami
              </Button>
              
              {!user ? (
                <div className="space-y-2 pt-4">
                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full text-blue-600 border-blue-600">
                      Masuk
                    </Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Daftar
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 pt-4">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    Jual Barang
                  </Button>
                  {userType === 'buyer' ? (
                    <>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Akun Saya
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Chat Saya
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="w-full justify-start">
                        <Store className="mr-2 h-4 w-4" />
                        Toko Saya
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Produk Saya
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Chat Saya
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleSignOut}>
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
