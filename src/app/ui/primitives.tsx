// app/ui/primitives.tsx
"use client";

import React from "react";
import Link from "next/link";

// ====== Tokens (sólidos + glass sutil) ======
export const surface     = "bg-white/95 backdrop-blur-[2px]";
export const surfaceAlt  = "bg-slate-50";
export const borderSoft  = "border-slate-200/90";
export const textBase    = "text-slate-800";
export const textMute    = "text-slate-500";
export const ringTeal    = "focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-0";
export const shadowSoft  = "shadow-sm";

// ====== Contenedores ======
export const shell    = `rounded-2xl border ${borderSoft} ${surface} ${shadowSoft}`;
export const shellPad = `${shell} px-4 py-4`;

export const Card = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`${shell} ${className}`} {...props} />
);

export const CardPad = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`${shellPad} ${className}`} {...props} />
);

// ====== Tipos pequeños ======
export const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border border-slate-300 bg-slate-100/90 text-slate-700 ${className}`}>
    {children}
  </span>
);

export const UnitBadge = ({ unit }: { unit?: string }) => <Badge>{unit || "—"}</Badge>;

// ====== Botones ======
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; href?: string };
const baseBtn = `inline-flex items-center gap-2 rounded-xl active:scale-[0.98] transition ${ringTeal}`;

export const btnGhost   = `${baseBtn} border ${borderSoft} ${surface} px-3 py-2 text-sm ${textBase} hover:bg-white/95`;
export const btnPrimary = `${baseBtn} bg-teal-600 hover:bg-teal-700 px-4 py-2 text-sm font-medium text-white`;
export const btnSubtle  = `${baseBtn} border ${borderSoft} ${surfaceAlt} px-3 py-2 text-sm ${textBase} hover:bg-slate-100`;

export function Button({ asChild, href, className = "", ...props }: BtnProps) {
  if (asChild && href) {
    return (
      <Link href={href} className={`${btnPrimary} ${className}`}>
        {props.children}
      </Link>
    );
  }
  return <button className={`${btnPrimary} ${className}`} {...props} />;
}

// ====== Inputs ======
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`rounded-full border ${borderSoft} ${surface} px-3 py-2 text-sm ${textBase} placeholder-slate-400 hover:bg-white/95 ${ringTeal} ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";

// ====== Enlaces estilo botón ======
export const LinkBtn = ({ href, className = "", children }: { href: string; className?: string; children: React.ReactNode }) => (
  <Link href={href} className={`inline-flex items-center gap-1 rounded-lg border ${borderSoft} ${surface} px-3 py-1.5 text-xs ${textBase} hover:bg-white/95 ${ringTeal} ${className}`}>
    {children}
  </Link>
);

// ====== Sparkline mínima ======
export function Sparkline({ points }: { points: number[] }) {
  const w = 80, h = 28;
  if (!points?.length) return <div className="h-[28px]" />;
  const max = Math.max(...points), min = Math.min(...points);
  const norm = (v: number) => h - (max === min ? h / 2 : ((v - min) / (max - min)) * (h - 4)) - 2;
  const step = points.length > 1 ? (w - 4) / (points.length - 1) : 0;
  return (
    <svg width={w} height={h} className="opacity-90">
      <polyline
        points={points.map((v, i) => `${2 + i * step},${norm(v)}`).join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-teal-500/90"
      />
    </svg>
  );
}
