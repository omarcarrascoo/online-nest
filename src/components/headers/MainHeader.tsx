"use client";
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Search, Brain } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-[#ffffff] shadow-md z-50 flex items-center justify-end px-6 py-3 gap-20">
      {/* Search Bar with icon */}
      <div className="relative w-[300px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-gray bg-transparent border border-gray-300 rounded-full pl-10 pr-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex gap-6 items-center">
        <Link href="/home" className="flex items-center gap-2 text-[#063a58] hover:text-gray-600">
          <Brain className="w-5 h-5" />
          <span>Asistente IA</span>
        </Link>
      </nav>

      {/* Profile + Logout + Current Route */}
      <div className="flex items-center gap-8">
        <span className="text-sm text-gray truncate max-w-xs">{pathname}</span>
        <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0">
          <Image
            src="/omar.jpg"
            alt="Perfil"
            fill
            className="object-cover object-center"
          />
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-700 text-sm text-white px-4 py-2 rounded-full hover:bg-red-800 transition-colors duration-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
