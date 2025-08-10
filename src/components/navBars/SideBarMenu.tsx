"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
} from 'phosphor-react';

const navItems = [
  { label: 'Dashboard',           path: '/dashboard',                        icon: House },
  { label: 'Residentes',          path: '/dashboard/residentes',            icon: UsersThree },
  { label: 'Proveedores',         path: '/dashboard/provedores',             icon: Package },
  { label: 'Personal y Nómina',   path: '/dashboard/personal-y-nomina',     icon: Suitcase },
  { label: 'Pagos',               path: '/dashboard/pagos',                  icon: CreditCard },
  { label: 'Ingresos',            path: '/dashboard/egresos-ingresos',      icon: ArrowUp },
  { label: 'Fondo y Presupuestos',path: '/dashboard/fondo-y-presupuestos',  icon: ChartBar },
  { label: 'Banca y Facturación', path: '/dashboard/banca-y-facturacion',   icon: FileDoc },
  { label: 'Caseta y Accesos',    path: '/dashboard/caseta-y-accesos',      icon: LockSimple },
  { label: 'Amenidades',          path: '/dashboard/amenidades',            icon: Gift },
  { label: 'Morosidad y Multas',  path: '/dashboard/morosidad-y-multas',    icon: WarningCircle },
];

export default function SidebarMenu() {
  return (
    <aside className="
      w-64
      h-screen
      fixed
      top-0
      left-0
      bg-gradient-to-b from-[#063a58] via-teal-700 to-[#1b3d50]
      text-white
      flex flex-col items-center
      py-6
      shadow-lg
      z-50
    ">
      {/* Logo */}
      <div className="mb-6 text-center">
        <Image src="/logo.png" alt="Nest Living Logo" width={100} height={100} />
        {/* <p className="text-xs tracking-widest uppercase mt-2">
          NEST<br/>LIVING
        </p> */}
      </div>

      <hr className="border-white/30 w-3/4 mb-6" />

      {/* Navigation */}
      <nav className="flex flex-col gap-2 w-full px-6">
        {navItems.map(({ label, path, icon: Icon }, idx) => (
          <Link
            key={idx}
            href={path}
            className="flex items-center gap-3 py-2 px-4 rounded-lg transition-colors hover:bg-white/20"
          >
            <Icon size={20} weight="regular" />
            <span className="text-sm tracking-wide font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
