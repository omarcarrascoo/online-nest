// app/layout.tsx
import Header from '@/components/headers/MainHeader';
import Sidebar from '@/components/navBars/SideBarMenu';
import { PropsWithChildren } from 'react';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <>
      {/* Header fijo arriba */}
      <Header />

      {/* Resto del layout, con padding-top para no quedar debajo del Header */}
      <div className="pt-16 flex">
        {/* Sidebar fija a la izquierda */}
        <Sidebar />

        {/* Contenido principal, con margen izquierdo para el Sidebar */}
        <main className="ml-64 flex-1 bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </>
  );
}
