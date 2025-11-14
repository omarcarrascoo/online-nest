"use client";

import React, { useState, useEffect, useMemo, JSX, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "../../../../utils/api";
import {
  UserIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

// Primitives sólidos (mismo look que ResidentsExplorer)
import {
  Card,
  CardPad,
  Input,
  Button,
  btnGhost as ghostBtn,
  btnPrimary as primaryBtn,
  borderSoft,
  surface,
  surfaceAlt,
  textBase,
  textMute,
  Badge,
  UnitBadge,
} from "@/app/ui/primitives";

/* =========================
   Types
========================= */
interface Contact {
  id?: string;
  name?: string;
  relationship?: string | null;
  phone?: string;
  email?: string;
}
interface DocumentInfo {
  id?: string;
  type: "LEASE" | "ID" | "OTHER";
  url?: string;
}
interface LeaseInfo {
  startDate?: string;
  endDate?: string;
  rentAmount?: number;
  securityDeposit?: number;
  terms?: string;
}
interface Statistic {
  totalPayments?: number;
  totalPaid?: number;
  avgPaymentDelayDays?: number;
  lastPaymentDate?: string;
  maintenanceRequests?: number;
  balanceOwed?: number;
}
interface Payment {
  id: string;
  category?: { name?: string };
  netAmount?: number;
  method?: string;
  status?: string;
  invoiceUrl?: string;
  paymentDate?: string;
}
interface Reservation {
  id: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  remarks?: string;
}
interface Resident {
  id: string;
  fullName?: string;
  unitNumber?: string;
  status?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  moveInDate?: string;
  moveOutDate?: string;
  primaryContact?: Contact;
  emergencyContacts?: Contact[];
  lease?: LeaseInfo;
  documents?: DocumentInfo[];
  statistics?: Statistic;
  payments?: Payment[];
  reservations?: Reservation[];
}

/* =========================
   Helpers
========================= */
const fmtMoney = (n?: number) =>
  (n ?? 0).toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

const toYMD = (s?: string) => (s ? s.split("T")[0] : "—");

const monthsES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function initials(full?: string) {
  if (!full) return "—";
  const p = full.trim().split(/\s+/);
  return (p[0]?.[0] ?? "") + (p[1]?.[0] ?? "");
}

function csvFromPayments(rows: Payment[]) {
  const header = ["Fecha","Categoría","Método","Monto neto","Estado","Factura"];
  const body = rows.map(r => [
    toYMD(r.paymentDate),
    r.category?.name ?? "",
    r.method ?? "",
    String(r.netAmount ?? ""),
    r.status ?? "",
    r.invoiceUrl ?? ""
  ]);
  const csv = [header, ...body].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function groupBy<T>(arr: T[], keyFn: (t: T) => string) {
  const map = new Map<string, T[]>();
  for (const item of arr) {
    const k = keyFn(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return Array.from(map.entries());
}

/* =========================
   Chips / Pills / Controls
========================= */
function StatusPill({ status }: { status?: string }) {
  const map: Record<string, string> = {
    PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    FAILED: "border-rose-200 bg-rose-50 text-rose-700",
  };
  const cls = map[status || ""] || `border ${borderSoft} ${surfaceAlt} ${textBase}`;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

function FieldRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px,1fr] items-center py-2">
      <span className={`text-xs ${textMute}`}>{label}</span>
      <span className={`text-sm ${textBase} truncate`}>{value ?? "—"}</span>
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className={`inline-flex rounded-xl border ${borderSoft} ${surfaceAlt} p-1`}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              active ? "bg-teal-600 text-white" : `${textBase} hover:bg-slate-100`
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* =========================
   Visuals: BarChart & Heatmap (con labels)
========================= */
function BarChart({
  data,
  labels,
  height = 160,
  format = (v: number) =>
    v.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }),
}: {
  data: number[];
  labels?: string[];
  height?: number;
  format?: (v: number) => string;
}) {
  // más fondo para etiquetas rotadas
  const hasLabels = Boolean(labels?.length);
  const padding = { top: 8, right: 12, bottom: hasLabels ? 52 : 12, left: 56 };
  // ancho por barra más amable en pantallas pequeñas
  const perBar = 40; // antes 48
  const W = Math.max(360, (labels?.length ?? data.length) * perBar);
  const H = height + padding.top + padding.bottom;

  const max = Math.max(1, ...data);
  const yTicks = [0, max / 2, max].map((v) => Math.round(v));
  const barW = Math.max(16, (W - padding.left - padding.right) / Math.max(1, data.length) - 12);

  // trunc util para labels largos
  const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={W}
        height={H}
        role="img"
        aria-label="Ingresos por periodo"
        className="block max-w-none"
      >
        <rect x={0} y={0} width={W} height={H} className="fill-white" />

        {yTicks.map((t, i) => {
          const y = padding.top + (1 - t / max) * height;
          return (
            <g key={i}>
              <line x1={padding.left} x2={W - padding.right} y1={y} y2={y} className="stroke-slate-200" />
              <text
                x={padding.left - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-slate-600 text-[10px]"
              >
                {format(t)}
              </text>
            </g>
          );
        })}

        <line
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={padding.top + height}
          className="stroke-slate-300"
        />

        {data.map((v, i) => {
          const x = padding.left + i * (barW + 12);
          const h = max === 0 ? 0 : (v / max) * height;
          const y = padding.top + height - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} className="fill-teal-600/85" rx={4}>
                <title>{`${labels?.[i] ?? `#${i + 1}`}: ${format(v)}`}</title>
              </rect>

              {/* Etiquetas rotadas para que no se encimen */}
              {hasLabels ? (
                <g transform={`translate(${x + barW / 2}, ${padding.top + height + 2}) rotate(-45)`}>
                  <text
                    textAnchor="end"
                    className="fill-slate-600 text-[10px]"
                  >
                    {cut(labels![i], 12)}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}

        <line
          x1={padding.left}
          x2={W - padding.right}
          y1={padding.top + height}
          y2={padding.top + height}
          className="stroke-slate-300"
        />
      </svg>

      <div className="mt-1 flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded bg-teal-600/85" />
        <span className="text-xs text-slate-600">Ingreso por periodo</span>
      </div>
    </div>
  );
}


function ActivityHeatmap({
  dates,
  weeks = 26, // ~6 meses
}: {
  dates: string[];
  weeks?: number;
}) {
  const cell = 12, gap = 3;
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - weeks * 7 + 1);

  const key = (d: Date) => d.toISOString().slice(0, 10);
  const set = new Set(dates.filter(Boolean).map((d) => d.slice(0, 10)));

  const columns: Date[] = [];
  for (let c = 0; c < weeks; c++) {
    const d = new Date(start);
    d.setDate(start.getDate() + c * 7);
    columns.push(d);
  }

  const shade = (n: number) =>
    n >= 3 ? "bg-teal-700" : n === 2 ? "bg-teal-500" : n === 1 ? "bg-teal-300" : "bg-slate-200";

  const density: number[][] = [];
  for (let c = 0; c < weeks; c++) {
    const col: number[] = [];
    for (let r = 0; r < 7; r++) {
      const d = new Date(columns[c]);
      d.setDate(columns[c].getDate() + r);
      const hit = set.has(key(d)) ? 1 : 0;
      const dUp = new Date(d); dUp.setDate(d.getDate() - 1);
      const dDown = new Date(d); dDown.setDate(d.getDate() + 1);
      const val = hit + (set.has(key(dUp)) ? 1 : 0) + (set.has(key(dDown)) ? 1 : 0);
      col.push(Math.min(3, val));
    }
    density.push(col);
  }

  const monthLabels = columns.map((d, i) => {
    const m = d.toLocaleString("es-MX", { month: "short" });
    const prev = i > 0 ? columns[i - 1].getMonth() : -1;
    return d.getMonth() !== prev ? m : "";
  });

  const totalWidth = weeks * (cell + gap);

  return (
    <div className="w-full">
      <div className="flex items-start gap-2 overflow-x-auto">
        <div className="pt-4 grid grid-rows-7 gap-[3px] shrink-0">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
            <div key={d} className="h-[12px] text-[10px] text-slate-500">{d}</div>
          ))}
        </div>

        {/* Canvas scrollable para que no se salga de la card */}
        <div className="relative shrink-0" style={{ width: totalWidth, height: 7 * (cell + gap) + 20, paddingTop: 20 }}>
          <div className="absolute left-0 top-0 right-0 h-5">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${weeks}, ${cell + gap}px)` }}>
              {monthLabels.map((m, i) => (
                <div key={i} className="text-[10px] text-slate-600">
                  {m}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute left-0 right-0" style={{ top: 20 }}>
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${weeks}, ${cell + gap}px)`,
                gridTemplateRows: `repeat(7, ${cell + gap}px)`,
              }}
            >
              {density.map((col, c) =>
                col.map((lvl, r) => (
                  <div key={`${c}-${r}`} className={`h-[12px] w-[12px] rounded ${shade(lvl)}`} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-slate-600 mr-1">Actividad</span>
        <span className="inline-block h-3 w-3 rounded bg-slate-200" />
        <span className="inline-block h-3 w-3 rounded bg-teal-300" />
        <span className="inline-block h-3 w-3 rounded bg-teal-500" />
        <span className="inline-block h-3 w-3 rounded bg-teal-700" />
      </div>
    </div>
  );
}


/* =========================
   Toast & Modal & Action Buttons
========================= */
function ActionGhostButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: JSX.Element }
) {
  const { icon, className, children, ...rest } = props;
  return (
    <button {...rest} className={`${ghostBtn} ${className || ""}`}>
      {icon}
      {children}
    </button>
  );
}

function ActionPrimaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: JSX.Element }
) {
  const { icon, className, children, ...rest } = props;
  return (
    <Button className={className} {...rest}>
      {icon}
      {children}
    </Button>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`relative rounded-2xl border ${borderSoft} ${surface} shadow-sm w-full max-w-md p-5`}>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  );
}

function Toast({
  open,
  tone = "success",
  message,
  onClose,
}: {
  open: boolean;
  tone?: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;
  const Icon = tone === "success" ? CheckCircleIcon : ExclamationTriangleIcon;
  const toneBox =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-rose-200 bg-rose-50 text-rose-800";
  return (
    <div className="fixed bottom-6 right-6 z-[998]">
      <div className={`flex items-center gap-2 rounded-xl px-4 py-3 border ${toneBox} shadow-sm`}>
        <Icon className="h-5 w-5" />
        <span className="text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 text-slate-600 hover:text-slate-900">×</button>
      </div>
    </div>
  );
}

/* =========================
   Page
========================= */
type Tab = "overview" | "payments" | "reservations" | "docs";

export default function ResidentPage(): JSX.Element {
  const router = useRouter();
  const { id } = useParams() as { id?: string };

  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Resident>>({});
  const [tab, setTab] = useState<Tab>("overview");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [toast, setToast] = useState<{ open: boolean; tone: "success" | "error"; msg: string }>({
    open: false,
    tone: "success",
    msg: "",
  });

  // filters
  const [payQuery, setPayQuery] = useState("");
  const [payStatus, setPayStatus] = useState<"ALL" | string>("ALL");

  const [resQuery, setResQuery] = useState("");
  const [resStatus, setResStatus] = useState<"ALL" | string>("ALL");

  useEffect(() => {
    if (!id) return;
    let alive = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    apiClient
      .get<Resident>(`/residents/${id}`, { signal: controller.signal as any })
      .then((res) => { if (alive) setResident(res.data); })
      .catch((err) => { if (alive) setError(err?.message ?? "Error al cargar el residente"); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; controller.abort(); };
  }, [id]);

  const payments = resident?.payments ?? [];
  const reservations = resident?.reservations ?? [];
  const documents = resident?.documents ?? [];

  const payFiltered = useMemo(() => {
    return payments
      .filter(p => `${p.category?.name ?? ""} ${p.method ?? ""} ${p.status ?? ""}`.toLowerCase().includes(payQuery.toLowerCase()))
      .filter(p => (payStatus === "ALL" ? true : p.status === payStatus))
      .sort((a, b) => {
        const da = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const db = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
        return db - da;
      });
  }, [payments, payQuery, payStatus]);

  const resFiltered = useMemo(() => {
    return reservations
      .filter(r => `${r.status ?? ""} ${r.remarks ?? ""}`.toLowerCase().includes(resQuery.toLowerCase()))
      .filter(r => (resStatus === "ALL" ? true : r.status === resStatus))
      .sort((a, b) => {
        const da = a.startTime ? new Date(a.startTime).getTime() : 0;
        const db = b.startTime ? new Date(b.startTime).getTime() : 0;
        return db - da;
      });
  }, [reservations, resQuery, resStatus]);

  const kpis = useMemo(() => {
    const total = payments.length;
    const totalPaid = payments.reduce((a, p) => a + (p.netAmount || 0), 0);
    const last = payments.map(p => p.paymentDate).filter(Boolean).sort().slice(-1)[0] || null;
    const avg = total ? Math.round(totalPaid / total) : 0;

    const byMonth = groupBy(payments, p => {
      const d = p.paymentDate ? new Date(p.paymentDate) : null;
      return d ? `${monthsES[d.getMonth()]} ${d.getFullYear()}` : "Sin fecha";
    }).sort((a, b) => {
      // ordenar por año/mes real si es posible
      const [ma, ya] = a[0].split(" ");
      const [mb, yb] = b[0].split(" ");
      const idxA = monthsES.indexOf(ma);
      const idxB = monthsES.indexOf(mb);
      const yA = parseInt(ya || "0", 10);
      const yB = parseInt(yb || "0", 10);
      if (yA !== yB) return yA - yB;
      return idxA - idxB;
    });

    const bars = byMonth.map(([_, rows]) => rows.reduce((s, r) => s + (r.netAmount || 0), 0));
    const barLabels = byMonth.map(([label]) => label);
    const activityDates = payments.map(p => p.paymentDate!).filter(Boolean);

    return { total, totalPaid, last, avg, bars, barLabels, activityDates };
  }, [payments]);

  const handleEdit = () => {
    if (!resident) return;
    setFormData({ ...resident });
    setEditMode(true);
  };
  const handleSave = (e?: FormEvent) => {
    e?.preventDefault?.();
    if (!id) return;
    apiClient
      .patch<Resident>(`/residents/${id}`, formData)
      .then((res) => {
        setResident(res.data);
        setEditMode(false);
        setToast({ open: true, tone: "success", msg: "Cambios guardados." });
      })
      .catch(() => setToast({ open: true, tone: "error", msg: "No se pudo guardar." }));
  };
  const handleCancel = () => setEditMode(false);

  const handleConfirmDelete = () => {
    if (!id) return;
    const name = resident?.fullName || "El usuario";
    apiClient
      .delete(`/residents/${id}`)
      .then(() => {
        setShowDeleteModal(false);
        setToast({ open: true, tone: "success", msg: `"${name}" fue eliminado.` });
        setTimeout(() => router.push("/dashboard/residentes"), 900);
      })
      .catch(() => {
        setShowDeleteModal(false);
        setToast({ open: true, tone: "error", msg: "No se pudo eliminar." });
      });
  };

  if (!id) {
    return <div className="max-w-6xl mx-auto p-6 text-center text-slate-600">Cargando…</div>;
  }
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="p-6"><p className={textMute}>Cargando residente…</p></Card>
      </div>
    );
  }
  if (error || !resident) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="p-6"><p className="text-rose-600">{error ?? "No se encontró el residente."}</p></Card>
      </div>
    );
  }

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* ===== Header de identidad + acciones rápidas ===== */}
      <CardPad>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold">
              {initials(resident.fullName)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-wide">
                {resident.fullName ?? "—"}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <span className={textMute}>Unidad</span>
                <UnitBadge unit={resident.unitNumber} />
                <span className="text-slate-300">•</span>
                <span className={textMute}>Estado</span>
                <Badge>{resident.status ?? "—"}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editMode ? (
              <>
                <ActionGhostButton onClick={handleEdit} icon={<PencilSquareIcon className="h-4 w-4" />}>Editar</ActionGhostButton>
                <ActionGhostButton onClick={() => { setDeleteInput(""); setShowDeleteModal(true); }} icon={<TrashIcon className="h-4 w-4" />}>Eliminar</ActionGhostButton>
                <ActionGhostButton onClick={() => router.back()} icon={<ArrowUturnLeftIcon className="h-4 w-4" />}>Volver</ActionGhostButton>
              </>
            ) : (
              <>
                <ActionGhostButton onClick={handleCancel} icon={<ArrowUturnLeftIcon className="h-4 w-4" />}>Cancelar</ActionGhostButton>
                <ActionPrimaryButton onClick={() => handleSave()}>Guardar cambios</ActionPrimaryButton>
              </>
            )}
          </div>
        </div>

        {/* KPIs compactos */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`rounded-xl border ${borderSoft} ${surfaceAlt} p-3`}>
            <p className={`text-xs ${textMute}`}>Pagos</p>
            <p className="text-xl text-slate-900">{kpis.total}</p>
          </div>
          <div className={`rounded-xl border ${borderSoft} ${surfaceAlt} p-3`}>
            <p className={`text-xs ${textMute}`}>Total pagado</p>
            <p className="text-xl text-slate-900">{fmtMoney(kpis.totalPaid)}</p>
          </div>
          <div className={`rounded-xl border ${borderSoft} ${surfaceAlt} p-3`}>
            <p className={`text-xs ${textMute}`}>Ticket promedio</p>
            <p className="text-xl text-slate-900">{fmtMoney(kpis.avg)}</p>
          </div>
          <div className={`rounded-xl border ${borderSoft} ${surfaceAlt} p-3`}>
            <p className={`text-xs ${textMute}`}>Último pago</p>
            <p className="text-xl text-slate-900">{toYMD(kpis.last ?? undefined)}</p>
          </div>
        </div>

       {/* Gráficas: barchart 2/3 + heatmap 1/3 */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Chart 1 */}
          <div className={`rounded-xl border ${borderSoft} ${surface} p-4 overflow-hidden`}>
            <p className={`text-sm ${textMute} mb-3`}>Ingreso por mes</p>
            <div className="min-w-0">
              <BarChart
                data={kpis.bars.length ? kpis.bars : [0]}
                labels={kpis.barLabels}
                height={160}
              />
            </div>
          </div>

          {/* Chart 2 */}
          <div className={`rounded-xl border ${borderSoft} ${surface} p-4 overflow-hidden`}>
            <p className={`text-sm ${textMute} mb-3`}>Actividad de pagos (≈6 meses)</p>
            <div className="min-w-0">
              <ActivityHeatmap dates={kpis.activityDates} />
            </div>
          </div>
        </div>

      </CardPad>

      {/* ===== Layout 2 columnas: sidebar info + contenido con tabs ===== */}
      {!editMode ? (
        <div className="grid gap-6 md:grid-cols-[320px,1fr]">
          {/* Sidebar fijo de persona */}
          <div className="md:sticky md:top-6 h-fit space-y-6">
            <Card className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-teal-600" /> Perfil
              </h2>
              <div className={`divide-y ${borderSoft}`}>
                <FieldRow label="Email" value={
                  resident.email ? <a href={`mailto:${resident.email}`} className="inline-flex items-center gap-1 text-teal-700 hover:underline">
                    <EnvelopeIcon className="h-4 w-4" /> {resident.email}
                  </a> : "—"
                } />
                <FieldRow label="Teléfono" value={resident.phone} />
                <FieldRow label="Tel. alterno" value={resident.alternatePhone} />
                <FieldRow label="Entrada" value={resident.moveInDate} />
                <FieldRow label="Salida" value={resident.moveOutDate} />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5 text-teal-600" /> Contacto primario
              </h2>
              <div className={`divide-y ${borderSoft}`}>
                <FieldRow label="Nombre" value={resident.primaryContact?.name} />
                <FieldRow label="Email" value={resident.primaryContact?.email} />
                <FieldRow label="Teléfono" value={resident.primaryContact?.phone} />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5 text-teal-600" /> Arrendamiento
              </h2>
              <div className={`divide-y ${borderSoft}`}>
                <FieldRow label="Inicio" value={resident.lease?.startDate} />
                <FieldRow label="Fin" value={resident.lease?.endDate} />
                <FieldRow label="Renta" value={fmtMoney(resident.lease?.rentAmount)} />
                <FieldRow label="Depósito" value={fmtMoney(resident.lease?.securityDeposit)} />
              </div>
            </Card>
          </div>

          {/* Contenido con tabs */}
          <div className="space-y-6">
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <Segmented<Tab>
                  value={tab}
                  onChange={setTab}
                  options={[
                    { label: "Resumen", value: "overview" },
                    { label: "Pagos", value: "payments" },
                    { label: "Reservas", value: "reservations" },
                    { label: "Docs", value: "docs" },
                  ]}
                />
                {tab === "payments" ? (
                  <div className="flex items-center gap-2">
                    <Input placeholder="Buscar pagos…" className="w-56" value={payQuery} onChange={(e) => setPayQuery(e.target.value)} />
                    <select
                      className={`rounded-xl border ${borderSoft} ${surface} px-3 py-2 text-sm ${textBase} focus:outline-none focus:ring-2 focus:ring-teal-200`}
                      value={payStatus}
                      onChange={(e) => setPayStatus(e.target.value)}
                    >
                      <option value="ALL">Todos</option>
                      {Array.from(new Set(payments.map((p) => p.status))).map((st) =>
                        st ? <option key={st} value={st}>{st}</option> : null
                      )}
                    </select>
                    <button
                      className={`${ghostBtn}`}
                      onClick={() => downloadBlob(csvFromPayments(payFiltered), `pagos_${resident.fullName ?? "residente"}.csv`)}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Exportar CSV
                    </button>
                  </div>
                ) : tab === "reservations" ? (
                  <div className="flex items-center gap-2">
                    <Input placeholder="Buscar reservas…" className="w-56" value={resQuery} onChange={(e) => setResQuery(e.target.value)} />
                    <select
                      className={`rounded-xl border ${borderSoft} ${surface} px-3 py-2 text-sm ${textBase} focus:outline-none focus:ring-2 focus:ring-teal-200`}
                      value={resStatus}
                      onChange={(e) => setResStatus(e.target.value)}
                    >
                      <option value="ALL">Todos</option>
                      {Array.from(new Set(reservations.map((r) => r.status))).map((st) =>
                        st ? <option key={st} value={st}>{st}</option> : null
                      )}
                    </select>
                  </div>
                ) : <div />}
              </div>
            </Card>

            {/* ======= PANELS ======= */}
            {tab === "overview" && (
              <div className="space-y-6">
                {/* Emergencias + Stats rápidos */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="p-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-3">Contactos de emergencia</h3>
                    {resident.emergencyContacts?.length ? (
                      <ul className="space-y-3">
                        {resident.emergencyContacts.map((c, i) => (
                          <li key={c.id ?? i} className={`rounded-xl border ${borderSoft} ${surfaceAlt} p-3`}>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge>{c.relationship || "Parentesco"}</Badge>
                              {c.email ? (
                                <a className="inline-flex items-center gap-1 text-teal-700 hover:underline" href={`mailto:${c.email}`}>
                                  <EnvelopeIcon className="h-4 w-4" /> {c.email}
                                </a>
                              ) : null}
                              {c.phone ? <Badge>{c.phone}</Badge> : null}
                            </div>
                            <p className={`mt-1 text-sm ${textBase}`}>{c.name ?? "—"}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={textMute}>Sin contactos de emergencia.</p>
                    )}
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-3">Estadísticas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Pagos", kpis.total],
                        ["Total pagado", fmtMoney(kpis.totalPaid)],
                        ["Prom. retraso (días)", resident.statistics?.avgPaymentDelayDays ?? 0],
                        ["Último pago", toYMD(kpis.last ?? undefined)],
                        ["Solicitudes Mto.", resident.statistics?.maintenanceRequests ?? 0],
                        ["Saldo adeudado", fmtMoney(resident.statistics?.balanceOwed)],
                      ].map(([label, value]) => (
                        <div key={label as string} className={`rounded-xl border ${borderSoft} ${surfaceAlt} p-3`}>
                          <p className={`text-xs ${textMute}`}>{label as string}</p>
                          <p className="text-lg text-slate-900">{value as string | number}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Timeline unificado simple (pagos + reservas) */}
                <Card className="p-6">
                  <h3 className="text-base font-semibold text-slate-900 mb-4">Actividad reciente</h3>
                  <ul className="space-y-3">
                    {[
                      ...payments.map(p => ({ type: "pago" as const, date: p.paymentDate ?? "", label: `${fmtMoney(p.netAmount)} • ${p.category?.name ?? "Pago"}`, status: p.status, id: p.id, link: p.invoiceUrl })),
                      ...reservations.map(r => ({ type: "reserva" as const, date: r.startTime ?? "", label: `Reserva • ${r.remarks ?? ""}`, status: r.status, id: r.id, link: undefined })),
                    ]
                      .filter(i => i.date)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 10)
                      .map((it) => (
                        <li key={`${it.type}-${it.id}`} className={`rounded-xl border ${borderSoft} ${surfaceAlt} p-3 flex items-center justify-between`}>
                          <div>
                            <p className="text-sm text-slate-900">{it.label}</p>
                            <p className={`text-xs ${textMute}`}>{toYMD(it.date)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusPill status={it.status} />
                            {it.link ? (
                              <a href={it.link} target="_blank" className={`${ghostBtn} px-2 py-1 text-xs`}>
                                <LinkIcon className="h-3.5 w-3.5" /> Ver
                              </a>
                            ) : null}
                          </div>
                        </li>
                      ))}
                  </ul>
                </Card>
              </div>
            )}

            {tab === "payments" && (
              <Card className="p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Historial de pagos</h3>
                {/* Agrupado por mes con totales */}
                <div className="space-y-6">
                  {groupBy(payFiltered, p => {
                    const d = p.paymentDate ? new Date(p.paymentDate) : null;
                    return d ? `${monthsES[d.getMonth()]} ${d.getFullYear()}` : "Sin fecha";
                  }).map(([month, rows]) => {
                    const subtotal = rows.reduce((s, r) => s + (r.netAmount || 0), 0);
                    return (
                      <div key={month} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                          <div className="text-sm font-medium text-slate-800">{month}</div>
                          <div className="text-sm text-slate-600">Subtotal: <span className="font-semibold text-slate-900">{fmtMoney(subtotal)}</span></div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm text-slate-800">
                            <thead className="bg-slate-50 text-slate-600">
                              <tr>
                                <th className="py-2 px-4 text-left">Fecha</th>
                                <th className="py-2 px-4 text-left">Categoría</th>
                                <th className="py-2 px-4 text-left">Método</th>
                                <th className="py-2 px-4 text-right">Monto</th>
                                <th className="py-2 px-4 text-left">Estado</th>
                                <th className="py-2 px-4 text-left">Factura</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                              {rows.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                  <td className="py-2 px-4">{toYMD(p.paymentDate)}</td>
                                  <td className="py-2 px-4">{p.category?.name ?? "—"}</td>
                                  <td className="py-2 px-4">{p.method ?? "—"}</td>
                                  <td className="py-2 px-4 text-right">{fmtMoney(p.netAmount)}</td>
                                  <td className="py-2 px-4"><StatusPill status={p.status} /></td>
                                  <td className="py-2 px-4">
                                    {p.invoiceUrl ? (
                                      <a href={p.invoiceUrl} target="_blank" className="inline-flex items-center gap-1 text-teal-700 hover:underline text-xs">
                                        <LinkIcon className="h-4 w-4" /> Ver
                                      </a>
                                    ) : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                  {!payFiltered.length && (
                    <div className={`rounded-xl border ${borderSoft} ${surfaceAlt} p-6 text-center ${textMute}`}>
                      Sin pagos con esos filtros.
                    </div>
                  )}
                </div>
              </Card>
            )}

            {tab === "reservations" && (
              <Card className="p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Reservas</h3>
                {resFiltered.length ? (
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {resFiltered.map((r) => (
                      <li key={r.id} className={`rounded-xl border ${borderSoft} ${surfaceAlt} p-4`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-900">{r.remarks ?? "Reserva"}</p>
                            <p className={`text-xs ${textMute}`}>{toYMD(r.startTime)} → {toYMD(r.endTime)}</p>
                          </div>
                          <StatusPill status={r.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={`rounded-xl border ${borderSoft} ${surfaceAlt} p-6 text-center ${textMute}`}>
                    No hay reservas con esos filtros.
                  </div>
                )}
              </Card>
            )}

            {tab === "docs" && (
              <Card className="p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Documentos</h3>
                {documents?.length ? (
                  <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {documents.map((d) => (
                      <li key={d.id} className={`rounded-xl border ${borderSoft} ${surfaceAlt} p-4`}>
                        <p className="text-sm text-slate-900 mb-2">[{d.type}]</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs text-slate-600">{d.url ?? "—"}</span>
                          {d.url ? (
                            <a href={d.url} target="_blank" className={`${ghostBtn} px-2 py-1 text-xs`}>
                              Ver
                            </a>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={`rounded-xl border ${borderSoft} ${surfaceAlt} p-6 text-center ${textMute}`}>
                    Sin documentos.
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* ======= EDIT MODE (sólido y breve) ======= */
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Editar datos básicos</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["fullName", "Nombre completo"],
                ["unitNumber", "Unidad"],
                ["status", "Estado"],
                ["email", "Email"],
                ["phone", "Teléfono"],
                ["alternatePhone", "Teléfono alt."],
                ["moveInDate", "Entrada"],
                ["moveOutDate", "Salida"],
              ].map(([key, label]) => (
                <Input
                  key={key}
                  type={String(key).includes("Date") ? "date" : "text"}
                  value={(formData as any)[key] ?? ""}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  placeholder={String(label)}
                />
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Editar arrendamiento</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["startDate", "Inicio"],
                ["endDate", "Fin"],
                ["rentAmount", "Renta"],
                ["securityDeposit", "Depósito"],
              ].map(([key, label]) => (
                <Input
                  key={key}
                  type={String(key).toLowerCase().includes("date") ? "date" : "text"}
                  value={(formData.lease as any)?.[key] ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lease: {
                        ...((formData.lease as LeaseInfo) ?? {}),
                        [key]:
                          key === "rentAmount" || key === "securityDeposit"
                            ? parseFloat(e.target.value || "0")
                            : e.target.value,
                      },
                    })
                  }
                  placeholder={String(label)}
                />
              ))}
              <textarea
                rows={3}
                value={(formData.lease as any)?.terms ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lease: { ...((formData.lease as LeaseInfo) ?? {}), terms: e.target.value },
                  })
                }
                placeholder="Términos"
                className={`w-full min-h-[96px] rounded-xl border ${borderSoft} ${surface} px-3 py-3 text-sm ${textBase} placeholder-slate-400 hover:bg-white/95 focus:outline-none focus:ring-2 focus:ring-teal-200 md:col-span-2`}
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-2">
            <ActionGhostButton onClick={handleCancel} icon={<ArrowUturnLeftIcon className="h-4 w-4" />}>
              Cancelar
            </ActionGhostButton>
            <ActionPrimaryButton type="submit">Guardar cambios</ActionPrimaryButton>
          </div>
        </form>
      )}

      {/* Modal de eliminación */}
      <Modal open={showDeleteModal} title="Confirmar eliminación" onClose={() => setShowDeleteModal(false)}>
        <p className={`text-sm ${textBase} mb-4`}>
          Para eliminar este residente, escribe su nombre completo exactamente:
          <br />
          <span className="text-slate-900 font-medium">{resident.fullName ?? "—"}</span>
        </p>
        <Input
          placeholder="Nombre completo del residente"
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <ActionGhostButton onClick={() => setShowDeleteModal(false)}>Cancelar</ActionGhostButton>
          <ActionPrimaryButton onClick={handleConfirmDelete} disabled={deleteInput !== resident.fullName}>
            Eliminar
          </ActionPrimaryButton>
        </div>
      </Modal>

      {/* Toasts */}
      <Toast
        open={toast.open}
        tone={toast.tone}
        message={toast.msg}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}
