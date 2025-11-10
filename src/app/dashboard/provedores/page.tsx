// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { apiClient } from "../../../utils/api";
// import {
//   Cog6ToothIcon,
//   PhoneIcon,
//   EnvelopeIcon,
//   CalendarDaysIcon,
//   BanknotesIcon,
//   StarIcon,
//   MagnifyingGlassIcon,
// } from "@heroicons/react/24/outline";
// import { GradientButton } from "@/components/buttons/GradientButton";

// interface ServiceType { id: string; name: string; }
// interface ProviderContact { contactName?: string; phone?: string; email?: string; }
// interface ProviderContract { startDate: string; endDate?: string; }
// interface ProviderStatistic { totalSpend: number; avgRating: number; }
// interface Provider {
//   id: string;
//   name: string;
//   legalName?: string;
//   serviceType?: ServiceType | null;
//   contact?: ProviderContact | null;
//   contract: ProviderContract;
//   statistics?: ProviderStatistic | null;
//   isActive: boolean;
// }

// export function ProvidersList() {
//   const [providers, setProviders] = useState<Provider[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     apiClient.get<Provider[]>("/providers")
//       .then(res => setProviders(res.data))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, []);

//   const filtered = providers.filter(p =>
//     p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (p.legalName ?? "").toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loading) return <div className="p-6 text-center">Cargando…</div>;

//   return (
//     <div className="container mx-auto p-4 max-w-6xl">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-3">
//         <h2 className="text-2xl font-bold">Proveedores</h2>
//         <div className="flex gap-2">
//           <div className="relative w-full sm:w-64">
//             <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
//             <input
//               className="w-full pl-10 pr-3 py-1.5 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//               placeholder="Buscar..."
//               value={searchTerm}
//               onChange={e => setSearchTerm(e.target.value)}
//             />
//           </div>
//             <GradientButton href="/dashboard/provedores/agregar">
//                + Agregar
//             </GradientButton>
//         </div>
//       </div>

//       {/* Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {filtered.length === 0 && (
//           <p className="col-span-full text-center text-gray-500">
//             No hay proveedores.
//           </p>
//         )}

//         {filtered.map((p) => (
//           <div
//             key={p.id}
//             className="bg-white rounded-xl shadow hover:shadow-md transition p-6 flex flex-col justify-between"
//           >
//             {/* Nombre */}
//             <div className="mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {p.name || "Nombre sin registrar"}
//               </h3>
//               {p.legalName && (
//                 <p className="text-sm text-gray-500">{p.legalName}</p>
//               )}
//             </div>

//             {/* Datos */}
//             <div className="grid grid-cols-1 gap-y-3 text-gray-700 text-sm">
//               {/* Servicio */}
//               <div className="flex items-center">
//                 <Cog6ToothIcon strokeWidth={1} className="h-5 w-5 text-[#063a58] mr-2" />
//                 <span className="font-medium">Servicio:</span>
//                 <span className="ml-auto">
//                   {p.serviceType?.name ?? "Servicio no registrado"}
//                 </span>
//               </div>

//               {/* Contrato */}
//               <div className="flex items-center">
//                 <CalendarDaysIcon strokeWidth={1} className="h-5 w-5 text-[#063a58] mr-2" />
//                 <span className="font-medium">Contrato:</span>
//                 <span className="ml-auto">
//                   {p.contract.startDate} – {p.contract.endDate ?? "Vigente"}
//                 </span>
//               </div>

//               {/* Contacto (opcional) */}
//               {p.contact?.contactName && (
//                 <div className="flex items-center">
//                   <PhoneIcon strokeWidth={1} className="h-5 w-5 text-[#063a58] mr-2" />
//                   <span className="font-medium">Contacto:</span>
//                   <span className="ml-auto">
//                     {p.contact.contactName}
//                     {p.contact.phone && ` (${p.contact.phone})`}
//                   </span>
//                 </div>
//               )}

//               {/* Email (opcional) */}
//               {p.contact?.email && (
//                 <div className="flex items-center">
//                   <EnvelopeIcon strokeWidth={1} className="h-5 w-5 text-[#063a58] mr-2" />
//                   <span className="font-medium">Email:</span>
//                   <span className="ml-auto truncate max-w-xs">
//                     {p.contact.email}
//                   </span>
//                 </div>
//               )}

//               {/* Gastos */}
//               <div className="flex items-center">
//                 <BanknotesIcon strokeWidth={1} className="h-5 w-5 text-[#063a58] mr-2" />
//                 <span className="font-medium">Gastos:</span>
//                 <span className="ml-auto">
//                   ${(p.statistics?.totalSpend ?? 0).toFixed(2)}
//                 </span>
//               </div>

//               {/* Calificación */}
//               <div className="flex items-center">
//                 <StarIcon strokeWidth={1} className="h-5 w-5 text-[#063a58] mr-2" />
//                 <span className="font-medium">Calificación:</span>
//                 <span className="ml-auto">
//                   {(p.statistics?.avgRating ?? 0).toFixed(2)}
//                 </span>
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
//               <span
//                 className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase ${
//                   p.isActive
//                     ? "bg-green-100 text-green-800"
//                     : "bg-red-100 text-red-800"
//                 }`}
//               >
//                 {p.isActive ? "Activo" : "Inactivo"}
//               </span>
//               <Link
//                 href={{
//                   pathname: `/dashboard/provedores/${p.id}`,
//                   query: {
//                     data: typeof window !== "undefined"
//                     ? btoa(JSON.stringify(p))
//                     : undefined,
//                   },
//                 }}
//                 onClick={() => {
//                   sessionStorage.setItem("providerData", JSON.stringify(p));
//                 }}
//                 className="text-green-600 hover:underline text-sm font-medium"
//               >
//                 Ver detalle →
//               </Link>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function ProvidersPage() {
//   return <ProvidersList />;
// }










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
  Mail,
  Phone,
  Building2,
  CalendarClock,
  BadgeCheck,
} from "lucide-react";

/* ========= Tipos ========= */
interface ServiceType { id: string; name: string; }
interface ProviderContact { contactName?: string; phone?: string; email?: string; }
interface ProviderContract { startDate: string; endDate?: string; }
interface ProviderStatistic { totalSpend: number; avgRating: number; }
interface Provider {
  id: string;
  name: string;
  legalName?: string;
  serviceType?: ServiceType | null;
  contact?: ProviderContact | null;
  contract: ProviderContract;
  statistics?: ProviderStatistic | null;
  isActive: boolean;
}

/* ========= Look & feel base (glass) ========= */
const glass =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]";
const edge =
  "pointer-events-none absolute -inset-px rounded-2xl [mask-image:linear-gradient(transparent,black,transparent)] bg-gradient-to-b from-white/10 via-transparent to-white/10";
const ghostBtn =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 active:scale-[0.98] transition";
const primaryBtn =
  "inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-sm font-medium text-white active:scale-[0.98] transition";

/* ========= Helpers ========= */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
}
function money(n?: number) {
  const v = Number.isFinite(n as number) ? (n as number) : 0;
  return `${v.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}
function toYmd(d?: string) {
  return d ? d.split("T")[0] : "—";
}
function daysUntil(iso?: string) {
  if (!iso) return Infinity;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}
function avg(xs: number[]) {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

type ViewMode = "cards" | "kanban" | "timeline";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("cards");
  const [sortKey, setSortKey] = useState<"name" | "spend" | "rating" | "expire">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // filtros rápidos
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [serviceFilter, setServiceFilter] = useState<"ALL" | string>("ALL");

  useEffect(() => {
    apiClient
      .get<Provider[]>("/providers")
      .then((res) => setProviders(res.data))
      .catch((err) => setError(err?.message || "Error"))
      .finally(() => setLoading(false));
  }, []);

  // métricas
  const metrics = useMemo(() => {
    const total = providers.length;
    const activos = providers.filter((p) => p.isActive).length;
    const gasto = providers.reduce((a, p) => a + (p.statistics?.totalSpend || 0), 0);
    const ratingProm = avg(providers.map((p) => p.statistics?.avgRating || 0));
    return { total, activos, gasto, ratingProm };
  }, [providers]);

  const serviceTypes = useMemo(() => {
    const set = new Set<string>();
    providers.forEach((p) => p.serviceType?.name && set.add(p.serviceType.name));
    return Array.from(set).sort();
  }, [providers]);

  // búsqueda + filtros + orden
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let base = providers.filter((p) => {
      if (statusFilter !== "ALL") {
        if (statusFilter === "ACTIVE" && !p.isActive) return false;
        if (statusFilter === "INACTIVE" && p.isActive) return false;
      }
      if (serviceFilter !== "ALL") {
        if ((p.serviceType?.name || "") !== serviceFilter) return false;
      }
      if (!q) return true;
      const hay = [p.name, p.legalName ?? "", p.contact?.contactName ?? "", p.contact?.email ?? "", p.contact?.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
      return hay;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    base = base.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "spend") return (((a.statistics?.totalSpend || 0) - (b.statistics?.totalSpend || 0)) * dir);
      if (sortKey === "rating") return (((a.statistics?.avgRating || 0) - (b.statistics?.avgRating || 0)) * dir);
      if (sortKey === "expire") {
        const ea = daysUntil(a.contract?.endDate);
        const eb = daysUntil(b.contract?.endDate);
        return (ea - eb) * dir;
      }
      return 0;
    });

    return base;
  }, [providers, search, statusFilter, serviceFilter, sortKey, sortDir]);

  const SortIcon = sortDir === "asc" ? ChevronUp : ChevronDown;

  /* ======= UI ======= */
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header / acciones */}
      <section className={`relative ${glass} px-4 py-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-wide">
              Proveedores
            </h2>
            <p className="text-sm text-white/70">
              Compra inteligente: contrato claro, gasto controlado, contacto a un clic.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Buscar…"
                className="w-64 rounded-full border border-white/15 bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-300/30 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link href="/dashboard/provedores/agregar" className={primaryBtn}>
              <Plus className="h-4 w-4" />
              Agregar
            </Link>
          </div>
        </div>

        {/* Métricas */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/60">Total</p>
            <p className="text-lg text-white/90">{metrics.total}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/60">Activos</p>
            <p className="text-lg text-white/90">{metrics.activos}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/60">Gasto acumulado</p>
            <p className="text-lg text-white/90">{money(metrics.gasto)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/60">Rating promedio</p>
            <p className="text-lg text-white/90">{(metrics.ratingProm || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Controles: vista / sort / filtros */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              className={`${ghostBtn} ${view === "cards" ? "ring-2 ring-teal-300/30" : ""}`}
              onClick={() => setView("cards")}
              aria-pressed={view === "cards"}
            >
              <Grid3X3 className="h-4 w-4" />
              Tarjetas
            </button>
            <button
              className={`${ghostBtn} ${view === "kanban" ? "ring-2 ring-teal-300/30" : ""}`}
              onClick={() => setView("kanban")}
              aria-pressed={view === "kanban"}
            >
              <Rows className="h-4 w-4" />
              Kanban por servicio
            </button>
            <button
              className={`${ghostBtn} ${view === "timeline" ? "ring-2 ring-teal-300/30" : ""}`}
              onClick={() => setView("timeline")}
              aria-pressed={view === "timeline"}
            >
              <Timer className="h-4 w-4" />
              Timeline contratos
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className={`${ghostBtn}`}>
              <Filter className="h-4 w-4" />
              <select
                className="bg-transparent text-white/90 focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">Estado: Todos</option>
                <option value="ACTIVE">Activos</option>
                <option value="INACTIVE">Inactivos</option>
              </select>
            </div>

            <div className={`${ghostBtn}`}>
              <Building2 className="h-4 w-4" />
              <select
                className="bg-transparent text-white/90 focus:outline-none"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <option value="ALL">Servicio: Todos</option>
                {serviceTypes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              className={ghostBtn}
              onClick={() => {
                if (sortKey === "name") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else { setSortKey("name"); setSortDir("asc"); }
              }}
            >
              Nombre {sortKey === "name" ? <SortIcon className="h-4 w-4" /> : null}
            </button>
            <button
              className={ghostBtn}
              onClick={() => {
                if (sortKey === "spend") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else { setSortKey("spend"); setSortDir("asc"); }
              }}
            >
              Gasto {sortKey === "spend" ? <SortIcon className="h-4 w-4" /> : null}
            </button>
            <button
              className={ghostBtn}
              onClick={() => {
                if (sortKey === "rating") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else { setSortKey("rating"); setSortDir("asc"); }
              }}
            >
              Rating {sortKey === "rating" ? <SortIcon className="h-4 w-4" /> : null}
            </button>
            <button
              className={ghostBtn}
              onClick={() => {
                if (sortKey === "expire") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else { setSortKey("expire"); setSortDir("asc"); }
              }}
            >
              Vencimiento {sortKey === "expire" ? <SortIcon className="h-4 w-4" /> : null}
            </button>
          </div>
        </div>

        <div aria-hidden className={edge} />
      </section>

      {/* ======= Vista TARJETAS ======= */}
      {view === "cards" && (
        <section className={`relative ${glass} p-4`}>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse h-36 rounded-xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-rose-200">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-white/70">No se encontraron proveedores.</div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((p) => {
                const end = p.contract?.endDate;
                const du = daysUntil(end);
                const statusChip =
                  !end || du === Infinity
                    ? { class: "border-white/15 bg-white/10 text-white/80", label: "Sin fin" }
                    : du < 0
                    ? { class: "border-rose-300/30 bg-rose-500/20 text-rose-100", label: "Vencido" }
                    : du <= 30
                    ? { class: "border-amber-300/30 bg-amber-500/20 text-amber-100", label: "Vence pronto" }
                    : { class: "border-teal-300/30 bg-teal-600/20 text-teal-100", label: "Vigente" };

                return (
                  <li key={p.id} className="relative rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm text-white/80">
                        {initials(p.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white/90 font-medium truncate">{p.name}</p>
                        <p className="text-white/60 text-xs truncate">{p.legalName || "—"}</p>
                      </div>
                      <span className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border ${statusChip.class}`}>
                        <CalendarClock className="h-3.5 w-3.5" />
                        {statusChip.label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                        <p className="text-white/60">Servicio</p>
                        <p className="text-white/90">{p.serviceType?.name || "—"}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                        <p className="text-white/60">Gasto</p>
                        <p className="text-white/90">{money(p.statistics?.totalSpend)}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                        <p className="text-white/60">Rating</p>
                        <p className="text-white/90">{(p.statistics?.avgRating || 0).toFixed(2)}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                        <p className="text-white/60">Contrato</p>
                        <p className="text-white/90">
                          {toYmd(p.contract?.startDate)} — {toYmd(p.contract?.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-white/70 inline-flex items-center gap-2">
                        <BadgeCheck className={`h-4 w-4 ${p.isActive ? "text-teal-300" : "text-rose-300"}`} />
                        {p.isActive ? "Activo" : "Inactivo"}
                      </div>
                      <div className="flex items-center gap-1">
                        {p.contact?.email && (
                          <a href={`mailto:${p.contact.email}`} className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/90 hover:bg-white/10">
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        {p.contact?.phone && (
                          <a href={`tel:${p.contact.phone}`} className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/90 hover:bg-white/10">
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                        <Link
                          href={`/dashboard/provedores/${p.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/90 hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div aria-hidden className={edge} />
        </section>
      )}

      {/* ======= Vista KANBAN por servicio ======= */}
      {view === "kanban" && (
        <section className={`relative ${glass} p-4`}>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse h-48 rounded-xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-rose-200">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-white/70">No se encontraron proveedores.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {Object.entries(
                filtered.reduce<Record<string, Provider[]>>((acc, p) => {
                  const key = p.serviceType?.name || "Sin servicio";
                  acc[key] = acc[key] || [];
                  acc[key].push(p);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([service, group]) => (
                  <div key={service} className="relative rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="inline-flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-white/70" />
                        <p className="text-sm text-white/90 font-medium">{service}</p>
                      </div>
                      <span className="text-xs text-white/60">{group.length}</span>
                    </div>
                    <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {group.map((p) => (
                        <li key={p.id} className="rounded-lg border border-white/10 bg-white/5 p-2">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-white/10 border border-white/10 text-[11px] text-white/80 flex items-center justify-center">
                              {initials(p.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white/90 text-sm truncate">{p.name}</p>
                              <p className="text-white/60 text-[11px] truncate">{p.contact?.contactName || "—"}</p>
                            </div>
                            <div className="ml-auto text-[11px] text-white/70">{money(p.statistics?.totalSpend)}</div>
                            <Link
                              href={`/dashboard/provedores/${p.id}`}
                              className="ml-2 inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-white/90 hover:bg-white/10"
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
          <div aria-hidden className={edge} />
        </section>
      )}

      {/* ======= Vista TIMELINE contratos ======= */}
      {view === "timeline" && (
        <section className={`relative ${glass} p-4`}>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse h-16 rounded-xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-rose-200">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-white/70">No se encontraron proveedores.</div>
          ) : (
            <ul className="relative pl-3">
              {/* línea vertical */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/10 rounded" />
              {filtered
                .slice()
                .sort((a, b) => {
                  const da = daysUntil(a.contract?.endDate);
                  const db = daysUntil(b.contract?.endDate);
                  // primero los que vencen antes
                  return da - db;
                })
                .map((p) => {
                  const du = daysUntil(p.contract?.endDate);
                  const chip =
                    !p.contract?.endDate
                      ? "bg-white/10"
                      : du < 0
                      ? "bg-rose-300"
                      : du <= 30
                      ? "bg-amber-300"
                      : "bg-teal-300";
                  return (
                    <li key={p.id} className="relative ml-2 pl-4 py-3">
                      {/* punto */}
                      <span className={`absolute left-[-7px] top-4 h-3 w-3 rounded-full ${chip}`} />
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10 text-xs text-white/80 flex items-center justify-center">
                            {initials(p.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white/90 font-medium truncate">{p.name}</p>
                            <p className="text-white/60 text-xs">
                              Contrato:{" "}
                              <span className="text-white/90">
                                {toYmd(p.contract?.startDate)} — {toYmd(p.contract?.endDate)}
                              </span>
                            </p>
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            <span className="text-xs text-white/70">{p.serviceType?.name || "—"}</span>
                            <span className="text-xs text-white/90">{money(p.statistics?.totalSpend)}</span>
                            <Link
                              href={`/dashboard/provedores/${p.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/90 hover:bg-white/10"
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
          <div aria-hidden className={edge} />
        </section>
      )}
    </div>
  );
}
