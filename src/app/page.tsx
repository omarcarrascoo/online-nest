"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/utils/api";
import { EnvelopeSimple, LockSimple, Eye, EyeSlash, ShieldCheck } from "phosphor-react";

/**
 * Nest Living · Modern Login
 * - Tailwind only (no extra deps)
 * - Subtle animated background + glass card
 * - Floating labels, bigger tap targets, improved focus states
 * - Accessible, keyboard friendly, error inline
 * - Respect system dark mode
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { email, password, remember });
      // Optional: localStorage.setItem('token', res.data.token)
      router.replace("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Error al iniciar sesión";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-dvh w-full overflow-hidden">
      {/* Animated gradient backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_50%_-10%,#0b4766_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_0%_100%,#0e5f6d_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_100%_100%,#1b3d50_0%,transparent_55%)]" />
        <div className="absolute inset-0 opacity-40 mix-blend-overlay animate-pulse-slow bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0)_75%,rgba(255,255,255,0.06)_100%)]" />
      </div>

      {/* Subtle grid/texture */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />

      {/* Content */}
      <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="flex flex-col items-center mb-6 select-none">
            <div className="relative h-20 w-20 mb-3">
              <Image src="/logo.png" alt="Nest Living" fill priority className="object-contain drop-shadow" />
            </div>
            <h1 className="text-white text-2xl font-semibold tracking-wide">Nest Living</h1>
            <p className="text-white/70 text-sm mt-1">Panel de administración</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/15 bg-white/1 dark:bg-white/1 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            {/* Card edge light */}
            <div className="pointer-events-none absolute -inset-px rounded-2xl [mask-image:linear-gradient(transparent,black,transparent)] bg-gradient-to-b from-white/20 via-transparent to-white/10" />

            <form onSubmit={handleSubmit} noValidate className="relative p-6 sm:p-7 space-y-5">
              {/* Email */}
              <div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <EnvelopeSimple size={18} className="text-gray-400" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    className="peer w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-300/30 focus:border-transparent"
                    aria-invalid={!!error}
                  />
                  <label htmlFor="email" className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 transition-all duration-200 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs">
                    Correo electrónico
                  </label>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <LockSimple size={18} className="text-gray-400" />
                  </span>
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    className="peer w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-300/30 focus:border-transparent"
                  />
                  <label htmlFor="password" className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 transition-all duration-200 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPwd ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-red-200/80 bg-red-50/90 dark:bg-red-500/10 dark:border-red-500/20 text-red-700 dark:text-red-300 p-3 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-none">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5zM10 14a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  <p className="leading-5">{error}</p>
                </div>
              )}

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-400"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="text-gray-700 dark:text-gray-300">Recordarme</span>
                </label>
                <Link href="/auth/forgot" className="text-teal-700 dark:text-teal-300 hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-xl bg-teal-600 text-white font-medium py-3 transition active:scale-[0.98] hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : (
                  "Ingresar"
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="px-6 sm:px-7">
              <div className="flex items-center my-5">
                <span className="h-px bg-gray-200/70 dark:bg-white/10 flex-1" />
                <span className="px-3 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">o</span>
                <span className="h-px bg-gray-200/70 dark:bg-white/10 flex-1" />
              </div>
            </div>

            {/* Secondary */}
            <div className="px-6 sm:px-7 pb-6 sm:pb-7 text-center text-sm text-gray-700 dark:text-gray-300">
              ¿No tienes acceso? <span className="font-medium text-gray-900 dark:text-gray-100">Contacta al administrador</span>
            </div>
          </div>

          {/* Legal */}
          <p className="text-center text-white/70 text-xs mt-6">
            Al continuar aceptas los Términos y el Aviso de Privacidad.
          </p>
        </div>
      </div>

      {/* Small helpers */}
      <style jsx global>{`
        .animate-pulse-slow { animation: pulseSlow 6s ease-in-out infinite; }
        @keyframes pulseSlow { 0%,100%{opacity:.25} 50%{opacity:.5} }
        @media (prefers-color-scheme: dark) {
          html { color-scheme: dark; }
        }
      `}</style>
    </main>
  );
}
