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

/* ========= Aurora White (futurista, elegante) =========
   - Superficie blanca con leve gradiente
   - Borde con “brillo” sutil (via background gradient)
   - Sombras limpias (ring + shadow)
   - Controles minimal sin glass borroso viejo */
const surface =
  "relative rounded-2xl ring-1 ring-gray-900/5 shadow-[0_10px_30px_rgba(2,6,23,0.06)] bg-[linear-gradient(180deg,white,rgba(255,255,255,0.92))]";
const surfacePad = `${surface} px-4 py-4`;

const chromeBtn =
  "inline-flex items-center gap-2 rounded-xl ring-1 ring-gray-200 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-white/90 hover:shadow-sm active:scale-[0.98] transition";
const primaryBtn =
  "inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0ea5e9_0%,#10b981_100%)] text-white px-4 py-2 text-sm font-medium shadow-[0_6px_18px_rgba(16,185,129,0.25)] hover:brightness-105 active:scale-[0.98] transition";

function unitBadge(unit?: string) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] ring-1 ring-gray-200 bg-white text-gray-700">
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
  return payments.map((p) => p.paymentDate).filter(Boolean).sort().slice(-1)[0];
}
function sumPayments(payments: Payment[]) {
  return payments?.reduce((a, b) => a + (b.amount || 0), 0) || 0;
}
function toYmd(d?: string) {
  return d ? d.split("T")[0] : "—";
}

/* Sparkline (cian elegante) */
function Sparkline({ points }: { points: number[] }) {
  const w = 80, h = 28;
  if (!points.length) return <div className="h-[28px]" />;
  const max = Math.max(...points), min = Math.min(...points);
  const norm = (v: number) =>
    h - (max === min ? h / 2 : ((v - min) / (max - min)) * (h - 4)) - 2;
  const step = points.length > 1 ? (w - 4) / (points.length - 1) : 0;
  return (
    <svg width={w} height={h} className="opacity-90">
      <polyline
        points={points.map((v, i) => `${2 + i * step},${norm(v)}`).join(" ")}
        fill="none"
        stroke="url(#grad)"
        strokeWidth="1.6"
      />
      <defs>
        <linearGradient id="grad" x1="0" x2="1">
          <stop offset="0" stopColor="#06b6d4" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
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
  const [sortKey, setSortKey] =
    useState<"name" | "unit" | "payments" | "lastpayment">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [view, setView] = useState<ViewMode>("cards");

  const [onlyWithDebt, setOnlyWithDebt] = useState(false);
  const [methodFilter, setMethodFilter] = useState<"ALL" | string>("ALL");

  useEffect(() => {
    apiClient
      .get<Resident[]>("/residents")
      .then((res) => setResidents(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const total = residents.length;
    const totalPayments = residents.reduce(
      (a, r) => a + (r.payments?.length || 0),
      0
    );
    const totalMXN = residents.reduce((a, r) => a + sumPayments(r.payments), 0);
    const withNoPayments = residents.filter((r) => !r.payments?.length).length;
    return { total, totalPayments, totalMXN, withNoPayments };
  }, [residents]);

  const paymentsMethods = useMemo(() => {
    const set = new Set<string>();
    residents.forEach((r) =>
      r.payments?.forEach((p) => p.method && set.add(p.method))
    );
    return Array.from(set).sort();
  }, [residents]);

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
          !last ||
          (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24) > 45;
        if (!overdue) return false;
      }
      if (!query) return true;
      return [r.fullName, r.unitNumber, r.email ?? "", r.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 bg-gradient-to-b from-white to-slate-50">
      {/* Header y acciones */}
      <section className={surfacePad}>
        {/* reborde iridiscente sutil */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl [mask-image:linear-gradient(transparent,black,transparent)] bg-[linear-gradient(180deg,rgba(14,165,233,0.12),transparent,rgba(16,185,129,0.12))]"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-wide">
              Residentes
            </h2>
            <p className="text-sm text-gray-600">
              Panel moderno para explorar, cobrar y actuar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar…"
                className="w-64 rounded-full ring-1 ring-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
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
          {[
            { label: "Residentes", value: metrics.total },
            { label: "Pagos totales", value: metrics.totalPayments },
            { label: "Monto recaudado", value: money(metrics.totalMXN) },
            { label: "Sin pagos", value: metrics.withNoPayments },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl ring-1 ring-gray-200 bg-white px-3 py-3"
            >
              <p className="text-xs text-gray-600">{m.label}</p>
              <p className="text-lg text-gray-900">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Controles: vista / sort / filtros rápidos */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              className={`${chromeBtn} ${view === "cards" ? "ring-cyan-300/60 ring-2" : ""}`}
              onClick={() => setView("cards")}
              aria-pressed={view === "cards"}
            >
              <Grid3X3 className="h-4 w-4" />
              Tarjetas
            </button>
            <button
              className={`${chromeBtn} ${view === "kanban" ? "ring-cyan-300/60 ring-2" : ""}`}
              onClick={() => setView("kanban")}
              aria-pressed={view === "kanban"}
            >
              <Rows className="h-4 w-4" />
              Kanban A-Z
            </button>
            <button
              className={`${chromeBtn} ${view === "timeline" ? "ring-cyan-300/60 ring-2" : ""}`}
              onClick={() => setView("timeline")}
              aria-pressed={view === "timeline"}
            >
              <Timer className="h-4 w-4" />
              Timeline pagos
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className={chromeBtn}>
              <Filter className="h-4 w-4" />
              <select
                className="bg-transparent text-gray-800 focus:outline-none"
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
              className={`${chromeBtn} ${onlyWithDebt ? "ring-amber-300/70 ring-2" : ""}`}
              onClick={() => setOnlyWithDebt((v) => !v)}
              aria-pressed={onlyWithDebt}
              title="Heurística: sin pagos o >45 días"
            >
              En riesgo
            </button>

            <button
              className={chromeBtn}
              onClick={() => {
                if (sortKey === "name") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else { setSortKey("name"); setSortDir("asc"); }
              }}
            >
              Nombre {sortKey === "name" ? <SortIcon className="h-4 w-4" /> : null}
            </button>
            <button
              className={chromeBtn}
              onClick={() => {
                if (sortKey === "unit") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else { setSortKey("unit"); setSortDir("asc"); }
              }}
            >
              Unidad {sortKey === "unit" ? <SortIcon className="h-4 w-4" /> : null}
            </button>
            <button
              className={chromeBtn}
              onClick={() => {
                if (sortKey === "payments") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else { setSortKey("payments"); setSortDir("asc"); }
              }}
            >
              Pagos {sortKey === "payments" ? <SortIcon className="h-4 w-4" /> : null}
            </button>
            <button
              className={chromeBtn}
              onClick={() => {
                if (sortKey === "lastpayment") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else { setSortKey("lastpayment"); setSortDir("asc"); }
              }}
            >
              Último pago {sortKey === "lastpayment" ? <SortIcon className="h-4 w-4" /> : null}
            </button>
          </div>
        </div>
      </section>

      {/* ======= Vista TARJETAS ======= */}
      {view === "cards" && (
        <section className="relative">
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="h-36 rounded-2xl animate-pulse bg-white ring-1 ring-gray-200" />
                ))
              : error
              ? [<li key="e" className="p-6 rounded-2xl bg-white ring-1 ring-rose-200 text-rose-700">{error}</li>]
              : filtered.length === 0
              ? [<li key="n" className="p-6 rounded-2xl bg-white ring-1 ring-gray-200 text-gray-600">No se encontraron residentes.</li>]
              : filtered.map((r) => {
                  const last = lastPaymentDate(r.payments);
                  const spark = r.payments.slice().sort((a,b)=>a.paymentDate.localeCompare(b.paymentDate)).map(p=>p.amount);
                  const risk = !last || (Date.now() - new Date(last).getTime()) / (1000*60*60*24) > 45;
                  return (
                    <li
                      key={r.id}
                      className="group relative rounded-2xl bg-white ring-1 ring-gray-200 p-4 hover:shadow-[0_16px_36px_rgba(2,6,23,0.08)] transition"
                    >
                      {/* halo iridiscente al hover */}
                      <div aria-hidden className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(120%_120%_at_50%_-10%,rgba(14,165,233,0.08),transparent_60%)]" />
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-white ring-1 ring-gray-200 flex items-center justify-center text-sm text-gray-800">
                          {initials(r.fullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-900 font-medium truncate">{r.fullName}</p>
                          <p className="text-gray-600 text-xs truncate">{r.email || "—"}</p>
                        </div>
                        <div className="ml-auto">{unitBadge(r.unitNumber)}</div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] ring-1 ring-gray-200 bg-white text-gray-800">
                            {r.payments.length} pagos
                          </span>
                          {risk ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] ring-1 ring-amber-200 bg-amber-50 text-amber-800">
                              en riesgo
                            </span>
                          ) : null}
                        </div>
                        <Link
                          href={`/dashboard/residentes/${r.id}`}
                          className="inline-flex items-center gap-1 rounded-lg ring-1 ring-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Link>
                      </div>

                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div className="text-xs text-gray-700">
                          <p>Último pago: <span className="text-gray-900">{toYmd(last)}</span></p>
                          <p>Total: <span className="text-gray-900">{money(sumPayments(r.payments))}</span></p>
                        </div>
                        <Sparkline points={spark} />
                      </div>
                    </li>
                  );
                })}
          </ul>
        </section>
      )}

      {/* ======= Vista KANBAN ======= */}
      {view === "kanban" && (
        <section className="relative">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-white ring-1 ring-gray-200 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-white ring-1 ring-rose-200 text-rose-700">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white ring-1 ring-gray-200 text-gray-600">No se encontraron residentes.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {Object.entries(
                filtered.reduce<Record<string, Resident[]>>((acc, r) => {
                  const key = (r.fullName[0] || "#").toUpperCase();
                  (acc[key] ||= []).push(r);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([letter, group]) => (
                  <div key={letter} className="relative rounded-2xl bg-white ring-1 ring-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-6 w-6 rounded-md bg-white ring-1 ring-gray-200 text-gray-800 text-sm flex items-center justify-center">
                        {letter}
                      </div>
                      <span className="text-xs text-gray-600">{group.length} resultado(s)</span>
                    </div>
                    <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {group.map((r) => (
                        <li key={r.id} className="rounded-lg ring-1 ring-gray-200 bg-white p-2 hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-white ring-1 ring-gray-200 text-[11px] text-gray-800 flex items-center justify-center">
                              {initials(r.fullName)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-gray-900 text-sm truncate">{r.fullName}</p>
                              <p className="text-gray-600 text-[11px] truncate">{r.email || "—"}</p>
                            </div>
                            <div className="ml-auto">{unitBadge(r.unitNumber)}</div>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-[11px] text-gray-700">{r.payments.length} pagos</span>
                            <Link
                              href={`/dashboard/residentes/${r.id}`}
                              className="inline-flex items-center gap-1 rounded-md ring-1 ring-gray-200 bg-white px-2 py-1 text-[11px] text-gray-800 hover:bg-gray-50"
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

      {/* ======= Vista TIMELINE ======= */}
      {view === "timeline" && (
        <section className="relative">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-white ring-1 ring-gray-200 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-white ring-1 ring-rose-200 text-rose-700">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white ring-1 ring-gray-200 text-gray-600">No se encontraron residentes.</div>
          ) : (
            <ul className="relative pl-3">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gray-200 rounded" />
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
                    !last || (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24) > 45;
                  return (
                    <li key={r.id} className="relative ml-2 pl-4 py-3">
                      <span
                        className={`absolute left-[-7px] top-4 h-3 w-3 rounded-full ${
                          risk ? "bg-amber-500" : "bg-cyan-600"
                        }`}
                      />
                      <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-3 hover:bg-gray-50 hover:shadow-[0_16px_36px_rgba(2,6,23,0.06)] transition">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-white ring-1 ring-gray-200 text-xs text-gray-800 flex items-center justify-center">
                            {initials(r.fullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-900 font-medium truncate">{r.fullName}</p>
                            <p className="text-gray-700 text-xs">
                              Último pago: <span className="text-gray-900">{toYmd(last)}</span>
                            </p>
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            {unitBadge(r.unitNumber)}
                            <span className="text-xs text-gray-700">{r.payments.length} pagos</span>
                            <span className="text-xs text-gray-900">{money(total)}</span>
                            <Link
                              href={`/dashboard/residentes/${r.id}`}
                              className="inline-flex items-center gap-1 rounded-lg ring-1 ring-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 hover:bg-gray-50"
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
