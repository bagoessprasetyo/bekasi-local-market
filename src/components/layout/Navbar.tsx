
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

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This will be managed by Supabase auth
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer'); // This will come from user profile

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">BekasiUMKM</h1>
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

            {!isLoggedIn ? (
              <>
                <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  Masuk
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Daftar
                </Button>
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
                    <DropdownMenuItem className="text-red-600">
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
              
              {!isLoggedIn ? (
                <div className="space-y-2 pt-4">
                  <Button variant="outline" className="w-full text-blue-600 border-blue-600">
                    Masuk
                  </Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Daftar
                  </Button>
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
                  <Button variant="ghost" className="w-full justify-start text-red-600">
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
