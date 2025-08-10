'use client';

import React from 'react';
import Link from 'next/link';

interface GradientButtonProps {
  /** Texto a mostrar dentro del botón */
  children: React.ReactNode;
  /** Ruta para Next.js Link */
  href?: string;
  /** Manejador de click alternativo */
  onClick?: () => void;
  /** Clase adicional opcional */
  className?: string;
  /** Tipo de botón, por defecto 'button' */
  type?: 'button' | 'submit' | 'reset';
}

export function GradientButton({
  children,
  href,
  onClick,
  className = '',
  type = 'button',
}: GradientButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-full px-7 py-2 text-sm font-medium text-white shadow-sm transition-transform transform';
  const gradientClasses =
    'bg-gradient-to-b from-[#105759]  to-[#2f7a5bf8] hover:baclkground-color: #1b3d50 hover:scale-104';

  const combined = `${baseClasses} ${gradientClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combined}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={combined} onClick={onClick}>
      {children}
    </button>
  );
}

// Ejemplo de uso:
// <GradientButton href="/dashboard/providers/add">
//   + Agregar
// </GradientButton>
// o
// <GradientButton onClick={() => console.log('Clicked!')}>
//   Guardar
// </GradientButton>
