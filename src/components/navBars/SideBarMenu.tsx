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
  { label: "Dashboard", path: "/dashboard", icon: House },
  { label: "Residentes", path: "/dashboard/residentes", icon: UsersThree },
  { label: "Proveedores", path: "/dashboard/provedores", icon: Package },
  { label: "Personal y Nómina", path: "/dashboard/personal-y-nomina", icon: Suitcase },
  { label: "Pagos", path: "/dashboard/pagos", icon: CreditCard },
  { label: "Ingresos", path: "/dashboard/egresos-ingresos", icon: ArrowUp },
  { label: "Fondo y Presupuestos", path: "/dashboard/fondo-y-presupuestos", icon: ChartBar },
  { label: "Banca y Facturación", path: "/dashboard/banca-y-facturacion", icon: FileDoc },
  { label: "Caseta y Accesos", path: "/dashboard/caseta-y-accesos", icon: LockSimple },
  { label: "Amenidades", path: "/dashboard/amenidades", icon: Gift },
  { label: "Morosidad y Multas", path: "/dashboard/morosidad-y-multas", icon: WarningCircle },
];

export default function SidebarMenu() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Navegación principal"
      className={[
        "fixed inset-y-0 left-0 z-50",
        "w-64",
        "backdrop-blur-xl",
        "border-r border-white/10",
        "bg-white/5",
        "shadow-[0_20px_40px_rgba(0,0,0,0.4)]",
        "flex flex-col",
        "justify-center"
      ].join(" ")}
    >
      {/* Gradient backdrops to match header */}
      
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_100%_0%,#0b4766_0%,transparent_60%)] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_600px_at_0%_100%,#1b3d50_0%,transparent_55%)] opacity-60" />

        {/* subtle grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
      
    {/* BRAND */}
      <div className="relative flex items-center gap-3 px-6 pt-6 pb-5">
        <div className="relative h-10 w-10">
          <Image src="/logo.png" alt="Nest Living" fill className="object-contain drop-shadow" priority />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white/90 tracking-wide">Nest Living</h1>
          <p className="text-xs text-white/60">Panel de administración</p>
        </div>
      </div>
      {/* Divider */}
      <div className="relative mx-6 h-px bg-white/10" />

      {/* NAV */}
      <nav className="relative mt-4 px-3 overflow-y-auto max-h-[calc(100vh-160px)] pr-2 scroll-smooth">
        <ul className="space-y-1">
          {navItems.map(({ label, path, icon: Icon }) => {
            const active = pathname === path || pathname?.startsWith(path + "/");

            return (
              <li key={path}>
                <Link
                  href={path}
                  className={[
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
                    "transition duration-150",
                    active
                      ? "bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] text-white"
                      : "hover:bg-white/5 text-white/80",
                  ].join(" ")}
                >
                  {/* Left Accent Bar */}
                  <span
                    className={[
                      "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full",
                      active ? "bg-teal-300/80" : "bg-transparent group-hover:bg-white/30",
                    ].join(" ")}
                    aria-hidden
                  />

                  <Icon
                    size={20}
                    weight={active ? "fill" : "regular"}
                    className={active ? "text-teal-200" : "text-white/70"}
                  />

                  <span className="text-sm font-medium tracking-wide">{label}</span>

                  {/* Hover Sheen */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition 
                               bg-[radial-gradient(80%_80%_at_50%_0%,rgba(255,255,255,0.12),transparent)]"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* FOOTER */}
      <div className="relative bottom-0 left-0 right-0 p-4">
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
          <p className="text-xs text-white/70">
            Sesión segura <span className="text-teal-300">•</span> TLS activo
          </p>
        </div>
      </div>
    </aside>
  );
}
