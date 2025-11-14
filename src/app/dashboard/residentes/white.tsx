"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiClient } from "../../../utils/api";
import {
  Search as SearchIcon,
  Plus,
  Eye,
  ChevronUp,
  ChevronDown,
  Grid3X3,
  Rows,
  Timer,
  Filter,
} from "lucide-react";

/* ========= Tipos ========= */
interface Payment {
  id: string;
  amount: number;
  method: string;
  paymentDate: string; // ISO
}
interface Resident {
  id: string;
  fullName: string;
  unitNumber: string;
  email?: string;
  phone?: string;
  payments: Payment[];
}

/* ========= Look & feel (light, friendly) ========= */
// Contenedores
const shell = "rounded-2xl border border-slate-200 bg-white shadow-sm";
const shellPad = `${shell} px-4 py-4`;
// Botones
const ghostBtn =
  "inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition";
const primaryBtn =
  "inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-sm font-medium text-white active:scale-[0.98] transition";
// Badges
function unitBadge(unit?: string) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border border-slate-300 bg-slate-100 text-slate-700">
      {unit || "—"}
    </span>
  );
}

/* ========= Helpers ========= */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
}
function money(n?: number) {
  return `${(n ?? 0).toLocaleString("es-MX")} MXN`;
}
function lastPaymentDate(payments: Payment[]) {
  if (!payments?.length) return undefined;
  return payments
    .map((p) => p.paymentDate)
    .filter(Boolean)
    .sort()
    .slice(-1)[0];
}
function sumPayments(payments: Payment[]) {
  return payments?.reduce((a, b) => a + (b.amount || 0), 0) || 0;
}
function toYmd(d?: string) {
  return d ? d.split("T")[0] : "—";
}

/* Sparkline (más clara) */
function Sparkline({ points }: { points: number[] }) {
  const w = 80;
  const h = 28;
  if (!points.length) return <div className="h-[28px]" />;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const norm = (v: number) =>
    h - (max === min ? h / 2 : ((v - min) / (max - min)) * (h - 4)) - 2;
  const step = points.length > 1 ? (w - 4) / (points.length - 1) : 0;
  return (
    <svg width={w} height={h} className="opacity-90">
      <polyline
        points={points.map((v, i) => `${2 + i * step},${norm(v)}`).join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-teal-500"
      />
    </svg>
  );
}

/* ========= Component ========= */
type ViewMode = "cards" | "kanban" | "timeline";

export default function ResidentsExplorer() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "unit" | "payments" | "lastpayment">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [view, setView] = useState<ViewMode>("cards");

  // filtros rápidos
  const [onlyWithDebt, setOnlyWithDebt] = useState(false);
  const [methodFilter, setMethodFilter] = useState<"ALL" | string>("ALL");

  useEffect(() => {
    apiClient
      .get<Resident[]>("/residents")
      .then((res) => setResidents(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // métricas
  const metrics = useMemo(() => {
    const total = residents.length;
    const totalPayments = residents.reduce((a, r) => a + (r.payments?.length || 0), 0);
    const totalMXN = residents.reduce((a, r) => a + sumPayments(r.payments), 0);
    const withNoPayments = residents.filter((r) => !r.payments?.length).length;
    return { total, totalPayments, totalMXN, withNoPayments };
  }, [residents]);

  const paymentsMethods = useMemo(() => {
    const set = new Set<string>();
    residents.forEach((r) => r.payments?.forEach((p) => p.method && set.add(p.method)));
    return Array.from(set).sort();
  }, [residents]);

  // búsqueda y orden
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    let base = residents.filter((r) => {
      if (methodFilter !== "ALL") {
        const hasMethod = r.payments?.some((p) => p.method === methodFilter);
        if (!hasMethod) return false;
      }
      if (onlyWithDebt) {
        const last = lastPaymentDate(r.payments);
        const overdue =
          !last || (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24) > 45;
        if (!overdue) return false;
      }
      if (!query) return true;
      const hay = [r.fullName, r.unitNumber, r.email ?? "", r.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
      return hay;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    base = base.sort((a, b) => {
      if (sortKey === "name") return a.fullName.localeCompare(b.fullName) * dir;
      if (sortKey === "unit") return a.unitNumber.localeCompare(b.unitNumber) * dir;
      if (sortKey === "payments")
        return ((a.payments?.length || 0) - (b.payments?.length || 0)) * dir;
      if (sortKey === "lastpayment") {
        const la = lastPaymentDate(a.payments) || "";
        const lb = lastPaymentDate(b.payments) || "";
        return la.localeCompare(lb) * dir;
      }
      return 0;
    });

    return base;
  }, [residents, search, sortKey, sortDir, methodFilter, onlyWithDebt]);

  const SortIcon = sortDir === "asc" ? ChevronUp : ChevronDown;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header y acciones */}
      <section className={shellPad}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-wide">
              Residentes
            </h2>
            <p className="text-sm text-slate-500">
              Explora, cobra y actúa sin perder el ritmo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar…"
                className="w-64 rounded-full border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link href="/dashboard/residentes/add" className={primaryBtn}>
              <Plus className="h-4 w-4" />
              Agregar
            </Link>
          </div>
        </div>

        {/* Métricas */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Residentes</p>
            <p className="text-lg text-slate-900">{metrics.total}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Pagos totales</p>
            <p className="text-lg text-slate-900">{metrics.totalPayments}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Monto recaudado</p>
            <p className="text-lg text-slate-900">{money(metrics.totalMXN)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Sin pagos</p>
            <p className="text-lg text-slate-900">{metrics.withNoPayments}</p>
          </div>
        </div>

        {/* Controles: vista / sort / filtros rápidos */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              className={`${ghostBtn} ${view === "cards" ? "ring-2 ring-teal-200" : ""}`}
              onClick={() => setView("cards")}
              aria-pressed={view === "cards"}
            >
              <Grid3X3 className="h-4 w-4" />
              Tarjetas
            </button>
            <button
              className={`${ghostBtn} ${view === "kanban" ? "ring-2 ring-teal-200" : ""}`}
              onClick={() => setView("kanban")}
              aria-pressed={view === "kanban"}
            >
              <Rows className="h-4 w-4" />
              Kanban A-Z
            </button>
            <button
              className={`${ghostBtn} ${view === "timeline" ? "ring-2 ring-teal-200" : ""}`}
              onClick={() => setView("timeline")}
              aria-pressed={view === "timeline"}
            >
              <Timer className="h-4 w-4" />
              Timeline pagos
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className={ghostBtn}>
              <Filter className="h-4 w-4" />
              <select
                className="bg-transparent text-slate-800 focus:outline-none"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="ALL">Método: Todos</option>
                {paymentsMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <button
              className={`${ghostBtn} ${onlyWithDebt ? "ring-2 ring-amber-200" : ""}`}
              onClick={() => setOnlyWithDebt((v) => !v)}
              aria-pressed={onlyWithDebt}
              title="Heurística: sin pagos o >45 días"
            >
              En riesgo
            </button>

            <button
              className={ghostBtn}
              onClick={() => {
                if (sortKey === "name") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else {
                  setSortKey("name");
                  setSortDir("asc");
                }
              }}
            >
              Nombre {sortKey === "name" ? <SortIcon className="h-4 w-4" /> : null}
            </button>
            <button
              className={ghostBtn}
              onClick={() => {
                if (sortKey === "unit") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else {
                  setSortKey("unit");
                  setSortDir("asc");
                }
              }}
            >
              Unidad {sortKey === "unit" ? <SortIcon className="h-4 w-4" /> : null}
            </button>
            <button
              className={ghostBtn}
              onClick={() => {
                if (sortKey === "payments") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else {
                  setSortKey("payments");
                  setSortDir("asc");
                }
              }}
            >
              Pagos {sortKey === "payments" ? <SortIcon className="h-4 w-4" /> : null}
            </button>
            <button
              className={ghostBtn}
              onClick={() => {
                if (sortKey === "lastpayment") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else {
                  setSortKey("lastpayment");
                  setSortDir("asc");
                }
              }}
            >
              Último pago {sortKey === "lastpayment" ? <SortIcon className="h-4 w-4" /> : null}
            </button>
          </div>
        </div>
      </section>

      {/* ======= Vista TARJETAS (smart cards) ======= */}
      {view === "cards" && (
        <section className={`${shell} p-4`}>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse h-36 rounded-xl border border-slate-200 bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-rose-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-slate-500">No se encontraron residentes.</div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((r) => {
                const last = lastPaymentDate(r.payments);
                const spark = r.payments
                  .slice()
                  .sort((a, b) => a.paymentDate.localeCompare(b.paymentDate))
                  .map((p) => p.amount);
                const risk =
                  !last ||
                  (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24) > 45;
                return (
                  <li
                    key={r.id}
                    className="relative rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm text-slate-700">
                        {initials(r.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-900 font-medium truncate">{r.fullName}</p>
                        <p className="text-slate-500 text-xs truncate">{r.email || "—"}</p>
                      </div>
                      <div className="ml-auto">{unitBadge(r.unitNumber)}</div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border border-slate-300 bg-slate-100 text-slate-700">
                          {r.payments.length} pagos
                        </span>
                        {risk ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border border-amber-200 bg-amber-100 text-amber-700">
                            en riesgo
                          </span>
                        ) : null}
                      </div>
                      <Link
                        href={`/dashboard/residentes/${r.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Link>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div className="text-xs text-slate-600">
                        <p>
                          Último pago: <span className="text-slate-900">{toYmd(last)}</span>
                        </p>
                        <p>
                          Total: <span className="text-slate-900">{money(sumPayments(r.payments))}</span>
                        </p>
                      </div>
                      <Sparkline points={spark} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* ======= Vista KANBAN A-Z ======= */}
      {view === "kanban" && (
        <section className={`${shell} p-4`}>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse h-48 rounded-xl border border-slate-200 bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-rose-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-slate-500">No se encontraron residentes.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {Object.entries(
                filtered.reduce<Record<string, Resident[]>>((acc, r) => {
                  const key = (r.fullName[0] || "#").toUpperCase();
                  acc[key] = acc[key] || [];
                  acc[key].push(r);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([letter, group]) => (
                  <div key={letter} className="relative rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-6 w-6 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-sm flex items-center justify-center">
                        {letter}
                      </div>
                      <span className="text-xs text-slate-500">{group.length} resultado(s)</span>
                    </div>
                    <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {group.map((r) => (
                        <li key={r.id} className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-700 flex items-center justify-center">
                              {initials(r.fullName)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-slate-900 text-sm truncate">{r.fullName}</p>
                              <p className="text-slate-500 text-[11px] truncate">{r.email || "—"}</p>
                            </div>
                            <div className="ml-auto">{unitBadge(r.unitNumber)}</div>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-[11px] text-slate-600">{r.payments.length} pagos</span>
                            <Link
                              href={`/dashboard/residentes/${r.id}`}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </section>
      )}

      {/* ======= Vista TIMELINE pagos ======= */}
      {view === "timeline" && (
        <section className={`${shell} p-4`}>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse h-16 rounded-xl border border-slate-200 bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-rose-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-slate-500">No se encontraron residentes.</div>
          ) : (
            <ul className="relative pl-3">
              {/* línea vertical */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-200 rounded" />
              {filtered
                .slice()
                .sort((a, b) => {
                  const la = lastPaymentDate(a.payments) || "";
                  const lb = lastPaymentDate(b.payments) || "";
                  return lb.localeCompare(la);
                })
                .map((r) => {
                  const last = lastPaymentDate(r.payments);
                  const total = sumPayments(r.payments);
                  const risk =
                    !last ||
                    (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24) > 45;
                  return (
                    <li key={r.id} className="relative ml-2 pl-4 py-3">
                      {/* punto */}
                      <span
                        className={`absolute left-[-7px] top-4 h-3 w-3 rounded-full ${
                          risk ? "bg-amber-400" : "bg-teal-500"
                        }`}
                      />
                      <div className="rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center justify-center">
                            {initials(r.fullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-900 font-medium truncate">{r.fullName}</p>
                            <p className="text-slate-600 text-xs">
                              Último pago: <span className="text-slate-900">{toYmd(last)}</span>
                            </p>
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            {unitBadge(r.unitNumber)}
                            <span className="text-xs text-slate-600">{r.payments.length} pagos</span>
                            <span className="text-xs text-slate-900">{money(total)}</span>
                            <Link
                              href={`/dashboard/residentes/${r.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                              Ver
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
