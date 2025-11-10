// "use client";
// import React from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import {
//   House,
//   UsersThree,
//   Package,
//   Suitcase,
//   CreditCard,
//   ArrowUp,
//   ChartBar,
//   FileDoc,
//   LockSimple,
//   Gift,
//   WarningCircle,
// } from 'phosphor-react';

// const navItems = [
//   { label: 'Dashboard',           path: '/dashboard',                        icon: House },
//   { label: 'Residentes',          path: '/dashboard/residentes',            icon: UsersThree },
//   { label: 'Proveedores',         path: '/dashboard/provedores',             icon: Package },
//   { label: 'Personal y Nómina',   path: '/dashboard/personal-y-nomina',     icon: Suitcase },
//   { label: 'Pagos',               path: '/dashboard/pagos',                  icon: CreditCard },
//   { label: 'Ingresos',            path: '/dashboard/egresos-ingresos',      icon: ArrowUp },
//   { label: 'Fondo y Presupuestos',path: '/dashboard/fondo-y-presupuestos',  icon: ChartBar },
//   { label: 'Banca y Facturación', path: '/dashboard/banca-y-facturacion',   icon: FileDoc },
//   { label: 'Caseta y Accesos',    path: '/dashboard/caseta-y-accesos',      icon: LockSimple },
//   { label: 'Amenidades',          path: '/dashboard/amenidades',            icon: Gift },
//   { label: 'Morosidad y Multas',  path: '/dashboard/morosidad-y-multas',    icon: WarningCircle },
// ];

// export default function SidebarMenu() {
//   return (
//     <aside className="
//       w-64
//       h-screen
//       fixed
//       top-0
//       left-0
//       bg-gradient-to-b from-[#063a58] via-teal-700 to-[#1b3d50]
//       text-white
//       flex flex-col items-center
//       py-6
//       shadow-lg
//       z-50
//     ">
//       {/* Logo */}
//       <div className="mb-6 text-center">
//         <Image src="/logo.png" alt="Nest Living Logo" width={100} height={100} />
//         {/* <p className="text-xs tracking-widest uppercase mt-2">
//           NEST<br/>LIVING
//         </p> */}
//       </div>

//       <hr className="border-white/30 w-3/4 mb-6" />

//       {/* Navigation */}
//       <nav className="flex flex-col gap-2 w-full px-6">
//         {navItems.map(({ label, path, icon: Icon }, idx) => (
//           <Link
//             key={idx}
//             href={path}
//             className="flex items-center gap-3 py-2 px-4 rounded-lg transition-colors hover:bg-white/20"
//           >
//             <Icon size={20} weight="regular" />
//             <span className="text-sm tracking-wide font-medium">{label}</span>
//           </Link>
//         ))}
//       </nav>
//     </aside>
//   );
// }























"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  UsersThree,
  Package,
  Suitcase,
  CreditCard,
  ArrowUp,
  ChartBar,
  FileDoc,
  LockSimple,
  Gift,
  WarningCircle,
} from "phosphor-react";

type Item = { label: string; path: string; icon: React.ComponentType<any> };

const navItems: Item[] = [
  { label: "Dashboard",            path: "/dashboard",                       icon: House },
  { label: "Residentes",           path: "/dashboard/residentes",            icon: UsersThree },
  { label: "Proveedores",          path: "/dashboard/provedores",            icon: Package },
  { label: "Personal y Nómina",    path: "/dashboard/personal-y-nomina",     icon: Suitcase },
  { label: "Pagos",                path: "/dashboard/pagos",                 icon: CreditCard },
  { label: "Ingresos",             path: "/dashboard/egresos-ingresos",      icon: ArrowUp },
  { label: "Fondo y Presupuestos", path: "/dashboard/fondo-y-presupuestos",  icon: ChartBar },
  { label: "Banca y Facturación",  path: "/dashboard/banca-y-facturacion",   icon: FileDoc },
  { label: "Caseta y Accesos",     path: "/dashboard/caseta-y-accesos",      icon: LockSimple },
  { label: "Amenidades",           path: "/dashboard/amenidades",            icon: Gift },
  { label: "Morosidad y Multas",   path: "/dashboard/morosidad-y-multas",    icon: WarningCircle },
];

export default function SidebarMenu() {
  const pathname = usePathname();

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50",
        "w-64 lg:w-72",
        "bg-[linear-gradient(to_bottom,#0b4766,#0e5f6d_40%,#1b3d50)]",
        "text-white/90",
        "backdrop-blur-xl border-r border-white/10",
        "shadow-[0_10px_30px_rgba(0,0,0,.35)]",
      ].join(" ")}
      aria-label="Navegación principal"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <div className="relative h-10 w-10">
          <Image src="/logo.png" alt="Nest Living" fill className="object-contain drop-shadow" priority />
        </div>
        <div className="select-none">
          <h1 className="text-sm font-semibold tracking-wide text-white">Nest Living</h1>
          <p className="text-xs text-white/60">Panel de administración</p>
        </div>
      </div>

      {/* Divider glass */}
      <div className="mx-6 h-px bg-white/10" />

      {/* Nav */}
      <nav className="mt-4 px-3 overflow-y-auto max-h-[calc(100vh-160px)] pr-2">
        <ul className="space-y-1">
          {navItems.map(({ label, path, icon: Icon }) => {
            const active = pathname === path || pathname?.startsWith(path + "/");
            return (
              <li key={path}>
                <Link
                  href={path}
                  className={[
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
                    "transition-colors duration-150",
                    active
                      ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)]"
                      : "hover:bg-white/[0.08] text-white/80",
                  ].join(" ")}
                >
                  {/* Left active indicator */}
                  <span
                    className={[
                      "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full",
                      active ? "bg-teal-300/80" : "bg-transparent group-hover:bg-white/30",
                    ].join(" ")}
                    aria-hidden
                  />
                  <Icon size={20} weight={active ? "fill" : "regular"} className={active ? "text-teal-200" : "text-white/80"} />
                  <span className="text-sm font-medium tracking-wide">{label}</span>
                  {/* Hover sheen */}
                  <span
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition
                               bg-[radial-gradient(80%_80%_at_50%_0%,rgba(255,255,255,0.12),transparent)]"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
          <p className="text-xs text-white/70">
            Sesión segura <span className="text-teal-300">•</span> TLS activo
          </p>
        </div>
      </div>
    </aside>
  );
}
