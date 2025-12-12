"use client";

import React, { useState, useEffect, JSX, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "../../../../utils/api";
import {
  UserIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TagIcon,
  CalendarDaysIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

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
   Small UI primitives
========================= */
const glass =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]";
const edge =
  "pointer-events-none absolute -inset-px rounded-2xl [mask-image:linear-gradient(transparent,black,transparent)] bg-gradient-to-b from-white/10 via-transparent to-white/10";

function GlassCard(props: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`relative ${glass} ${props.className ?? ""}`}>
      {props.children}
      <div aria-hidden className={edge} />
    </section>
  );
}

function FieldRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px,1fr] items-center py-2">
      <span className="text-sm text-white/60">{label}</span>
      <span className="text-sm text-white/90 truncate">{value ?? "—"}</span>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-white/10 bg-white/10 text-white/80">
      {children}
    </span>
  );
}

function StatusPill({ status }: { status?: string }) {
  const map: Record<string, string> = {
    PAID: "bg-emerald-600/30 border-emerald-400/30 text-emerald-200",
    PENDING: "bg-amber-600/30 border-amber-400/30 text-amber-200",
    FAILED: "bg-rose-600/30 border-rose-400/30 text-rose-200",
  };
  const cls =
    map[status || ""] || "bg-white/10 border-white/15 text-white/80";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

function ActionGhostButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: JSX.Element }
) {
  const { icon, className, ...rest } = props;
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10 active:scale-[0.98] transition ${className || ""}`}
    >
      {icon}
      {props.children}
    </button>
  );
}

function ActionPrimaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: JSX.Element }
) {
  const { icon, className, ...rest } = props;
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-medium text-white active:scale-[0.98] transition ${className || ""}`}
    >
      {icon}
      {props.children}
    </button>
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`relative ${glass} w-full max-w-md p-5`}>
          <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
          {children}
          <div aria-hidden className={edge} />
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
  const Icon =
    tone === "success" ? CheckCircleIcon : ExclamationTriangleIcon;
  const toneCls =
    tone === "success"
      ? "border-emerald-400/30 bg-emerald-600/20 text-emerald-100"
      : "border-rose-400/30 bg-rose-600/20 text-rose-100";
  return (
    <div className="fixed bottom-6 right-6 z-[998]">
      <div className={`flex items-center gap-2 rounded-xl px-4 py-3 border ${toneCls} ${glass}`}>
        <Icon className="h-5 w-5" />
        <span className="text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 text-white/70 hover:text-white">×</button>
      </div>
    </div>
  );
}

/* =========================
   Page
========================= */
export default function ResidentPage(): JSX.Element {
  const router = useRouter();
  const { id } = useParams() as { id?: string };

  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Resident>>({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [toast, setToast] = useState<{open:boolean; tone:"success"|"error"; msg:string}>({open:false, tone:"success", msg:""});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | string>("ALL");
  const [reservationSearch, setReservationSearch] = useState("");
  const [reservationStatusFilter, setReservationStatusFilter] = useState<"ALL" | string>("ALL");

  useEffect(() => {
    if (!id) return;
    let alive = true;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    apiClient
      .get<Resident>(`/residents/${id}`, { signal: controller.signal as any })
      .then((res) => {
        if (!alive) return;
        setResident(res.data);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message ?? "Error al cargar el residente");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, [id]);

  const emergency = resident?.emergencyContacts ?? [];
  const documents = resident?.documents ?? [];
  const payments = resident?.payments ?? [];
  const reservations = resident?.reservations ?? [];

  const filteredPayments = payments
    .filter((p) =>
      `${p.category?.name ?? ""} ${p.method ?? ""} ${p.status ?? ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((p) => (statusFilter === "ALL" ? true : p.status === statusFilter));

  const filteredReservations = reservations
    .filter((r) =>
      `${r.status ?? ""} ${r.remarks ?? ""}`.toLowerCase().includes(reservationSearch.toLowerCase())
    )
    .filter((r) => (reservationStatusFilter === "ALL" ? true : r.status === reservationStatusFilter));

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
        setToast({open:true, tone:"success", msg:"Cambios guardados."});
      })
      .catch((error) => {
        console.error("Error updating resident", error);
        setToast({open:true, tone:"error", msg:"No se pudo guardar."});
      });
  };

  const handleCancel = () => setEditMode(false);

  const handleConfirmDelete = () => {
    if (!id) return;
    const name = resident?.fullName || "El usuario";
    apiClient
      .delete(`/residents/${id}`)
      .then(() => {
        setShowDeleteModal(false);
        setToast({open:true, tone:"success", msg:`"${name}" fue eliminado.`});
        setTimeout(() => router.push("/dashboard/residentes"), 1200);
      })
      .catch(() => {
        setShowDeleteModal(false);
        setToast({open:true, tone:"error", msg:"No se pudo eliminar. Intenta de nuevo."});
      });
  };

  if (!id) {
    return <div className="max-w-6xl mx-auto p-6 text-center text-white/70">Cargando…</div>;
  }
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <GlassCard className="p-6">
          <p className="text-white/70">Cargando residente…</p>
        </GlassCard>
      </div>
    );
  }
  if (error || !resident) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <GlassCard className="p-6">
          <p className="text-rose-200">{error ?? "No se encontró el residente."}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Banner encabezado */}
      <GlassCard className="px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-wide">
              {resident.fullName ?? "—"}
            </h1>
            <p className="text-sm text-white/70 mt-1">
              Unidad: <Badge>{resident.unitNumber ?? "—"}</Badge> <span className="mx-1">·</span>
              Estado: <Badge>{resident.status ?? "—"}</Badge>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editMode ? (
              <>
                <ActionGhostButton onClick={handleEdit} icon={<PencilSquareIcon className="h-4 w-4" />}>
                  Editar
                </ActionGhostButton>
                <ActionGhostButton
                  onClick={() => { setDeleteInput(""); setShowDeleteModal(true); }}
                  icon={<TrashIcon className="h-4 w-4" />}
                >
                  Eliminar
                </ActionGhostButton>
                <ActionGhostButton onClick={() => router.back()} icon={<ArrowUturnLeftIcon className="h-4 w-4" />}>
                  Volver
                </ActionGhostButton>
              </>
            ) : (
              <>
                <ActionGhostButton onClick={handleCancel} icon={<ArrowUturnLeftIcon className="h-4 w-4" />}>
                  Cancelar
                </ActionGhostButton>
                <ActionPrimaryButton onClick={() => handleSave()}>
                  Guardar cambios
                </ActionPrimaryButton>
              </>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Grid principal */}
      {!editMode ? (
        <>
          {/* Info general + Contactos */}
          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard className="p-6">
              <h2 className="flex items-center text-lg font-semibold text-white mb-4">
                <UserIcon className="h-5 w-5 text-teal-200 mr-2" />
                Información general
              </h2>
              <div className="divide-y divide-white/10">
                <FieldRow label="Email" value={resident.email} />
                <FieldRow label="Teléfono" value={resident.phone} />
                <FieldRow label="Teléfono alt." value={resident.alternatePhone} />
                <FieldRow label="Entrada" value={resident.moveInDate} />
                <FieldRow label="Salida" value={resident.moveOutDate} />
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="flex items-center text-lg font-semibold text-white mb-4">
                <InformationCircleIcon className="h-5 w-5 text-teal-200 mr-2" />
                Contacto primario
              </h2>
              <div className="divide-y divide-white/10">
                <FieldRow label="Nombre" value={resident.primaryContact?.name} />
                <FieldRow label="Email" value={resident.primaryContact?.email} />
                <FieldRow label="Teléfono" value={resident.primaryContact?.phone} />
              </div>
            </GlassCard>
          </div>

          {/* Emergencias + Arrendamiento */}
          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard className="p-6">
              <h2 className="flex items-center text-lg font-semibold text-white mb-4">
                <InformationCircleIcon className="h-5 w-5 text-teal-200 mr-2" />
                Contactos de emergencia
              </h2>
              {resident.emergencyContacts?.length ? (
                <div className="divide-y divide-white/10">
                  {resident.emergencyContacts?.map((c, i) => (
                    <div key={c.id ?? i} className="py-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge>{c.relationship || "Parentesco"}</Badge>
                        {c.email ? <Badge>{c.email}</Badge> : null}
                        {c.phone ? <Badge>{c.phone}</Badge> : null}
                      </div>
                      <p className="text-sm text-white/90">{c.name ?? "—"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/60">Sin contactos de emergencia.</p>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="flex items-center text-lg font-semibold text-white mb-4">
                <CurrencyDollarIcon className="h-5 w-5 text-teal-200 mr-2" />
                Información de arrendamiento
              </h2>
              <div className="divide-y divide-white/10">
                <FieldRow label="Inicio" value={resident.lease?.startDate} />
                <FieldRow label="Fin" value={resident.lease?.endDate} />
                <FieldRow label="Renta" value={`${resident.lease?.rentAmount ?? 0} MXN`} />
                <FieldRow label="Depósito" value={`${resident.lease?.securityDeposit ?? 0} MXN`} />
                <FieldRow label="Términos" value={resident.lease?.terms} />
              </div>
            </GlassCard>
          </div>

          {/* Stats + Documentos */}
          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard className="p-6">
              <h2 className="flex items-center text-lg font-semibold text-white mb-4">
                <TagIcon className="h-5 w-5 text-teal-200 mr-2" />
                Estadísticas
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/60">Pagos totales</p>
                  <p className="text-lg text-white/90">{resident.statistics?.totalPayments ?? 0}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/60">Total pagado</p>
                  <p className="text-lg text-white/90">{resident.statistics?.totalPaid ?? 0} MXN</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/60">Retraso prom. (días)</p>
                  <p className="text-lg text-white/90">{resident.statistics?.avgPaymentDelayDays ?? 0}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/60">Último pago</p>
                  <p className="text-lg text-white/90">{resident.statistics?.lastPaymentDate ?? "—"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/60">Solicitudes Mto.</p>
                  <p className="text-lg text-white/90">{resident.statistics?.maintenanceRequests ?? 0}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/60">Saldo adeudado</p>
                  <p className="text-lg text-white/90">{resident.statistics?.balanceOwed ?? 0} MXN</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="flex items-center text-lg font-semibold text-white mb-4">
                <DocumentTextIcon className="h-5 w-5 text-teal-200 mr-2" />
                Documentos
              </h2>
              {documents?.length ? (
                <ul className="space-y-2 text-sm">
                  {documents.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-2">
                      <span className="truncate text-white/80">
                        <span className="text-white/60 mr-1">[{d.type}]</span>
                        {d.url ?? "—"}
                      </span>
                      {d.url ? (
                        <a
                          href={d.url}
                          target="_blank"
                          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/90 hover:bg-white/10"
                        >
                          Ver
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/60">Sin documentos.</p>
              )}
            </GlassCard>
          </div>

          {/* Pagos */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center text-lg font-semibold text-white">
                <EnvelopeIcon className="h-5 w-5 text-teal-200 mr-2" />
                Historial de pagos
              </h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Buscar pagos…"
                  className="w-64 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-300/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-300/30"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Todos</option>
                  {Array.from(new Set(payments.map((p) => p.status))).map((st) =>
                    st ? (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="py-2 px-4 text-left">Fecha</th>
                    <th className="py-2 px-4 text-left">Categoría</th>
                    <th className="py-2 px-4 text-left">Método</th>
                    <th className="py-2 px-4 text-left">Monto neto</th>
                    <th className="py-2 px-4 text-left">Estado</th>
                    <th className="py-2 px-4 text-left">Factura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="py-2 px-4">{p.paymentDate?.split("T")[0] ?? "—"}</td>
                      <td className="py-2 px-4">{p.category?.name ?? "—"}</td>
                      <td className="py-2 px-4">{p.method ?? "—"}</td>
                      <td className="py-2 px-4">{p.netAmount ?? 0} MXN</td>
                      <td className="py-2 px-4"><StatusPill status={p.status} /></td>
                      <td className="py-2 px-4">
                        {p.invoiceUrl ? (
                          <a
                            href={p.invoiceUrl}
                            target="_blank"
                            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/90 hover:bg-white/10"
                          >
                            Ver
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Reservas */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center text-lg font-semibold text-white">
                <CalendarDaysIcon className="h-5 w-5 text-teal-200 mr-2" />
                Reservas
              </h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Buscar reservas…"
                  className="w-64 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-300/30"
                  value={reservationSearch}
                  onChange={(e) => setReservationSearch(e.target.value)}
                />
                <select
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-300/30"
                  value={reservationStatusFilter}
                  onChange={(e) => setReservationStatusFilter(e.target.value)}
                >
                  <option value="ALL">Todos</option>
                  {Array.from(new Set(reservations.map((r) => r.status))).map((st) =>
                    st ? (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="py-2 px-4 text-left">Inicio</th>
                    <th className="py-2 px-4 text-left">Fin</th>
                    <th className="py-2 px-4 text-left">Estado</th>
                    <th className="py-2 px-4 text-left">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredReservations.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5">
                      <td className="py-2 px-4">{r.startTime?.split("T")[0] ?? "—"}</td>
                      <td className="py-2 px-4">{r.endTime?.split("T")[0] ?? "—"}</td>
                      <td className="py-2 px-4"><StatusPill status={r.status} /></td>
                      <td className="py-2 px-4">{r.remarks ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      ) : (
        /* Modo edición mínimo para no romper el flujo */
        <form onSubmit={handleSave} className="space-y-6">
          <GlassCard className="p-6">
            <h2 className="flex items-center text-lg font-semibold text-white mb-4">
              <UserIcon className="h-5 w-5 text-teal-200 mr-2" />
              Editar datos básicos
            </h2>
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
                <div key={key} className="relative">
                  <input
                    type={key.includes("Date") ? "date" : "text"}
                    value={(formData as any)[key] ?? ""}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder=" "
                    className="peer w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-transparent px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300/30 focus:border-transparent"
                  />
                  <label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60 transition-all duration-200 peer-focus:-top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="flex items-center text-lg font-semibold text-white mb-4">
              <CurrencyDollarIcon className="h-5 w-5 text-teal-200 mr-2" />
              Editar arrendamiento
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["startDate", "Inicio"],
                ["endDate", "Fin"],
                ["rentAmount", "Renta"],
                ["securityDeposit", "Depósito"],
              ].map(([key, label]) => (
                <div key={key} className="relative">
                  <input
                    type={key.toLowerCase().includes("date") ? "date" : "text"}
                    value={(formData.lease as any)?.[key] ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lease: {
                          ...((formData.lease as LeaseInfo) ?? {}),
                          [key]:
                            key === "rentAmount" || key === "securityDeposit"
                              ? parseFloat(e.target.value)
                              : e.target.value,
                        },
                      })
                    }
                    placeholder=" "
                    className="peer w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-transparent px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300/30 focus:border-transparent"
                  />
                  <label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60 transition-all duration-200 peer-focus:-top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs">
                    {label}
                  </label>
                </div>
              ))}
              <div className="md:col-span-2 relative">
                <textarea
                  rows={3}
                  value={(formData.lease as any)?.terms ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lease: { ...((formData.lease as LeaseInfo) ?? {}), terms: e.target.value },
                    })
                  }
                  placeholder=" "
                  className="peer w-full min-h-[96px] rounded-xl border border-white/10 bg-white/5 text-white placeholder-transparent px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300/30 focus:border-transparent"
                />
                <label className="pointer-events-none absolute left-3 top-3 text-white/60 transition-all duration-200 peer-focus:-top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs">
                  Términos
                </label>
              </div>
            </div>
          </GlassCard>

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
        <p className="text-sm text-white/80 mb-4">
          Para eliminar este residente, escribe su nombre completo exactamente:
          <br />
          <span className="text-white font-medium">{resident.fullName ?? "—"}</span>
        </p>
        <input
          type="text"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-300/30 focus:border-transparent mb-4"
          placeholder="Nombre completo del residente"
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <ActionGhostButton onClick={() => setShowDeleteModal(false)}>Cancelar</ActionGhostButton>
          <ActionPrimaryButton
            onClick={handleConfirmDelete}
            disabled={deleteInput !== resident.fullName}
          >
            Eliminar
          </ActionPrimaryButton>
        </div>
      </Modal>

      {/* Toasts */}
      <Toast open={toast.open} tone={toast.tone} message={toast.msg} onClose={() => setToast(s => ({...s, open:false}))} />
    </div>
  );
}
