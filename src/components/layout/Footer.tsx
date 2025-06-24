
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">BekasiUMKM</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Platform digital yang menghubungkan UMKM lokal Bekasi dengan pembeli. 
              Dukung ekonomi lokal dengan berbelanja produk berkualitas dari tetangga Anda.
            </p>
            <div className="flex items-center text-gray-300">
              <Heart className="w-4 h-4 text-red-400 mr-2" />
              <span className="text-sm">Mendukung UMKM Lokal Bekasi</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Tautan Cepat</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Jelajahi Produk
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Cara Jual
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Cara Beli
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                  UMKM Unggulan
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hubungi Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-3 text-blue-400" />
                <span className="text-sm">info@bekasiumkm.com</span>
              </li>
              <li className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 mr-3 text-blue-400" />
                <span className="text-sm">+62 812-3456-7890</span>
              </li>
              <li className="flex items-start text-gray-300">
                <MapPin className="w-4 h-4 mr-3 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">Bekasi, Jawa Barat, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 BekasiUMKM - Komunitas UMKM Bekasi
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Syarat & Ketentuan
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Bantuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
