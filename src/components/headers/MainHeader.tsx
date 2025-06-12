"use client";
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    // TODO: Implement logout (e.g. clear cookies, redirect to login)
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50 flex items-center justify-end px-6 py-3 gap-20">
      {/* Search Bar */}
      <div className="flex-1 max-w-xs">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex gap-6">
        <Link href="/home">
          <span className="text-gray-700 hover:text-gray-900">Sugerencia IA</span>
        </Link>
        <Link href="/about">
          <span className="text-gray-700 hover:text-gray-900">Reportar Problema</span>
        </Link>
        <Link href="/contact">
          <span className="text-gray-700 hover:text-gray-900">Contacto</span>
        </Link>
      </nav>

      {/* Profile + Logout + Current Route */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{pathname}</span>
        <Image
          src="/omar.jpg"
          alt="Perfil"
          width={40}
          height={40}
          className="rounded-full"
        />
        <button
          onClick={handleLogout}
          className="bg-red-800 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors duration-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
