// "use client";
// import { usePathname, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Image from 'next/image';
// import { useState } from 'react';
// import { Search, Brain } from 'lucide-react';

// export default function Header() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [searchQuery, setSearchQuery] = useState('');

//   const handleLogout = () => {
//     router.push('/login');
//   };

//   return (
//     <header className="fixed top-0 left-0 w-full bg-[#ffffff] shadow-md z-50 flex items-center justify-end px-6 py-3 gap-20">
//       {/* Search Bar with icon */}
//       <div className="relative w-[300px]">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
//         <input
//           type="text"
//           placeholder="Buscar..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full text-gray bg-transparent border border-gray-300 rounded-full pl-10 pr-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-700"
//         />
//       </div>

//       {/* Navigation Links */}
//       <nav className="flex gap-6 items-center">
//         <Link href="/home" className="flex items-center gap-2 text-[#063a58] hover:text-gray-600">
//           <Brain className="w-5 h-5" />
//           <span>Asistente IA</span>
//         </Link>
//       </nav>

//       {/* Profile + Logout + Current Route */}
//       <div className="flex items-center gap-8">
//         <span className="text-sm text-gray truncate max-w-xs">{pathname}</span>
//         <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0">
//           <Image
//             src="/omar.jpg"
//             alt="Perfil"
//             fill
//             className="object-cover object-center"
//           />
//         </div>
//         <button
//           onClick={handleLogout}
//           className="bg-red-700 text-sm text-white px-4 py-2 rounded-full hover:bg-red-800 transition-colors duration-100"
//         >
//           Logout
//         </button>
//       </div>
//     </header>
//   );
// }











"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Brain, LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <header className="fixed inset-x-70 top-0 right-0 z-200">
      {/* Backdrop gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_50%_-10%,#0b4766_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_0%_100%,#0e5f6d_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_100%_100%,#1b3d50_0%,transparent_55%)]" />
        <div className="absolute inset-0 opacity-40 mix-blend-overlay animate-pulse-slow bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0)_75%,rgba(255,255,255,0.06)_100%)]" />
      </div>

      {/* Glass container */}
      <div className="relative h-[72px] mx-3 sm:mx-4 mt-3 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <div className="flex h-full items-center justify-between px-3 sm:px-5 gap-3">
          {/* Left: Brand / Home */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link
              href="/home"
              className="group inline-flex items-center gap-2 text-white/90 hover:text-white transition"
            >
              {/* <span className="relative h-8 w-8">
                <Image
                  src="/logo.png"
                  alt="Nest Living"
                  fill
                  className="object-contain drop-shadow"
                  priority
                />
              </span> */}
              {/* <span className="hidden sm:block font-semibold tracking-wide">
                Nest Living
              </span> */}
            </Link>

            {/* Current route breadcrumb-ish */}
            <span
              title={pathname}
              className="hidden md:block text-xs text-white/70 truncate max-w-[240px]"
            >
              {pathname}
            </span>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Buscar…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-full border border-white/15 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-300/30 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right: Nav + Profile + Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/home"
              className="hidden sm:inline-flex items-center gap-2 text-white/90 hover:text-white transition"
            >
              <Brain className="w-5 h-5" />
              <span className="font-medium">Asistente IA</span>
            </Link>

            {/* Avatar */}
            <div className="relative h-9 w-9 rounded-full overflow-hidden ring-1 ring-white/20 shrink-0">
              <Image
                src="/omar.jpg"
                alt="Perfil"
                fill
                className="object-cover object-center"
              />
            </div>

            {/* Logout: subtle ghost button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 active:scale-[0.98] transition disabled:opacity-60"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Salir</span>
            </button>
          </div>
        </div>

        {/* Edge light */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl [mask-image:linear-gradient(transparent,black,transparent)] bg-gradient-to-b from-white/15 via-transparent to-white/10"
        />
      </div>

      {/* Optional grid texture */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[72px] opacity-10 bg-[linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:36px_36px]"
      />
      <style jsx global>{`
        @media (prefers-color-scheme: dark) {
          html {
            color-scheme: dark;
          }
        }
      `}</style>
    </header>
  );
}

