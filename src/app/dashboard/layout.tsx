"use client";
// app/layout.tsx
import Header from "@/components/headers/MainHeader";
import Sidebar from "@/components/navBars/SideBarMenu";
import { PropsWithChildren } from "react";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-[#0a1218]">
      {/* Background compacto y más luminoso */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Wash vertical para levantar medios */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_35%,rgba(255,255,255,0)_70%)]" />

        {/* Orbes más pequeños y cercanos, menor opacidad */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute inset-0 bg-[radial-gradient(600px_420px_at_45%_-10%,#0b4766_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(520px_360px_at_0%_60%,#0e5f6d_0%,transparent_58%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(520px_360px_at_100%_70%,#1b3d50_0%,transparent_58%)]" />
        </div>

        {/* Textura más densa (grid fino) */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:28px_28px]" />

        {/* Ruido sutil para evitar bandas (no bloquea clicks) */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>\
<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>\
<rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/>\
</svg>\")",
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      {/* Contenido */}
      <Header />

      <div className="pt-20 flex relative z-10">
        <Sidebar />

        {/* Contenido principal */}
        <main className="ml-64 flex-1 p-6 text-white">
          {children}
        </main>
      </div>

      {/* Sin animaciones para no oscurecer en scroll largo */}
    </main>
  );
}
