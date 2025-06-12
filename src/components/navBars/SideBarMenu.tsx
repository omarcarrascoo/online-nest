// components/Sidebar.tsx
import Image from 'next/image';
import Link from 'next/link';

const navItems = [
  'Dashboard',
  'Pagos',
  'Residentes',
  'Presupuestos',
  'Proveedores',
  'Morosidad y Multas',
  'Caseta y Accesos',
  'Egresos/Ingresos',
  'Fondo y Presupuestos',
  'Banca y Facturacion',
  'Amenidades',
  'Personal y Nomina',
];

export default function Sidebar() {
  return (
    <aside
      className="
        w-64
        h-screen
        fixed
        top-0
        left-0
        bg-[#2F4E46]
        text-white
        flex flex-col items-center
        py-6
        z-100
      "
    >
      {/* Logo */}
      <div className="mb-6 text-center">
        <Image src="/logo.png" alt="Nest Living Logo" width={100} height={100} />
        <p className="text-xs tracking-widest">NEST<br/>LIVING</p>
      </div>

      <hr className="border-gray-400 w-3/4 mb-4" />

      {/* Navigation */}
      <nav className="flex flex-col gap-3 w-full px-6">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            href={`/${item.toLowerCase().replace(/ /g, '-')}`}
          >
            <span className="text-xs tracking-widest hover:text-gray-300 cursor-pointer">
              {item}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
