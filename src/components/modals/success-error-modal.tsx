"use client";

import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, XCircle } from "phosphor-react";

function ModalShell({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" aria-hidden={!open}>
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      />
      <div className="relative w-full max-w-md origin-top rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-[modalIn_180ms_ease-out]">
        {children}
      </div>
      <style jsx>{`
        @keyframes modalIn {
          from { opacity:.6; transform: translateY(-4px) scale(.98); }
          to   { opacity:1;  transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}

export interface NestModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: React.ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  autoCloseMs?: number;
}

export function SuccessModal({
  open,
  onClose,
  title = "Acción completada",
  description = "Tu operación se realizó con éxito.",
  primaryLabel = "Aceptar",
  onPrimary,
  secondaryLabel,
  onSecondary,
  autoCloseMs,
}: NestModalProps) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open || !autoCloseMs) return;
    const t = setTimeout(() => onClose(), autoCloseMs);
    return () => clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  return (
    <ModalShell open={open} onClose={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId}>
        <header className="flex items-start gap-3 p-5 pb-3">
          <div className="shrink-0"><CheckCircle size={28} className="text-emerald-600" /></div>
          <div className="flex-1">
            <h3 id={titleId} className="text-lg font-semibold text-gray-900">{title}</h3>
            <p id={descId} className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </header>
        <footer className="flex items-center justify-end gap-2 p-5 pt-3">
          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondary}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {secondaryLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onPrimary ?? onClose}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            {primaryLabel}
          </button>
        </footer>
      </div>
    </ModalShell>
  );
}

export function ErrorModal({
  open,
  onClose,
  title = "Algo salió mal",
  description = "Ocurrió un error inesperado. Intenta nuevamente.",
  primaryLabel = "Entendido",
  onPrimary,
  secondaryLabel,
  onSecondary,
  autoCloseMs,
}: NestModalProps) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open || !autoCloseMs) return;
    const t = setTimeout(() => onClose(), autoCloseMs);
    return () => clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  return (
    <ModalShell open={open} onClose={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId}>
        <header className="flex items-start gap-3 p-5 pb-3">
          <div className="shrink-0"><XCircle size={28} className="text-red-600" /></div>
          <div className="flex-1">
            <h3 id={titleId} className="text-lg font-semibold text-gray-900">{title}</h3>
            <p id={descId} className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </header>
        <footer className="flex items-center justify-end gap-2 p-5 pt-3">
          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondary}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {secondaryLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onPrimary ?? onClose}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
          >
            {primaryLabel}
          </button>
        </footer>
      </div>
    </ModalShell>
  );
}
