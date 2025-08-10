// src/app/dashboard/residentes/[id]/page.tsx
"use client";

import React, { useState, useEffect, JSX, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "../../../../utils/api";
import {
  UserIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TagIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

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

const renderRows = (items: [string, string | number][]) => (
  <div className="divide-y divide-gray-100">
    {items.map(([label, value]) => (
      <div key={label} className="flex justify-between py-2">
        <span className="text-gray-500 uppercase text-xs">{label}</span>
        <span className="text-gray-900 font-normal">{value ?? "—"}</span>
      </div>
    ))}
  </div>
);

export default function ResidentPage({ params }: { params: { id: string } }): JSX.Element {
  const { id } = params;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Resident>>({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | string>("ALL");
  const [reservationSearch, setReservationSearch] = useState("");
  const [reservationStatusFilter, setReservationStatusFilter] = useState<"ALL" | string>("ALL");

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      try {
        setResident(JSON.parse(atob(dataParam)));
        setLoading(false);
        return;
      } catch {}
    }
    apiClient
      .get<Resident>(`/residents/${id}`)
      .then((res) => setResident(res.data))
      .finally(() => setLoading(false));
  }, [id, searchParams]);

  const emergency = resident?.emergencyContacts ?? [];
  const documents = resident?.documents ?? [];
  const payments = resident?.payments ?? [];
  const reservations = resident?.reservations ?? [];

  const filteredPayments = payments
    .filter((p) =>
      `${p.category?.name} ${p.method} ${p.status}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((p) => (statusFilter === "ALL" ? true : p.status === statusFilter));

  const filteredReservations = reservations
    .filter((r) =>
      `${r.status} ${r.remarks}`.toLowerCase().includes(reservationSearch.toLowerCase())
    )
    .filter((r) => (reservationStatusFilter === "ALL" ? true : r.status === reservationStatusFilter));

  const handleEdit = () => {
    if (!resident) return;
    setFormData({ ...resident });
    setEditMode(true);
  };
  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    apiClient
      .put<Resident>(`/residents/${id}`, formData)
      .then((res) => {
        setResident(res.data);
        setEditMode(false);
      })
      .catch(() => alert("Error al guardar cambios"));
  };
  const handleCancel = () => setEditMode(false);

  const openDeleteModal = () => {
    setDeleteInput("");
    setShowDeleteModal(true);
  };
  const handleCancelDelete = () => setShowDeleteModal(false);
  const handleConfirmDelete = () => {
    apiClient
      .delete(`/residents/${id}`)
      .then(() => router.push("/residents"))
      .catch(() => alert("Error al eliminar"));
  };

  if (loading || !resident) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center text-gray-600">
        Cargando residente…
      </div>
    );
  }

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* Header con acciones */}
      <header>
        <div className="flex items-center justify-between bg-gradient-to-r from-[#063a58] via-teal-700 to-[#1b3d50] rounded-md px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Residentes: {resident.fullName ?? "—"}
            </h1>
            <p className="mt-1 text-white text-sm">
              Unidad: {resident.unitNumber ?? "—"} | Estado: {resident.status ?? "—"}
            </p>
          </div>
          <div className="flex gap-2">
            {!editMode ? (
              <>
                <button
                  onClick={handleEdit}
                  className="text-white border border-white rounded-full px-3 py-1 text-sm hover:bg-white hover:text-[#063a58] transition"
                >
                  Editar
                </button>
                <button
                  onClick={openDeleteModal}
                  className="text-white border border-white rounded-full px-3 py-1 text-sm hover:bg-white hover:text-[#063a58] transition"
                >
                  Eliminar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="text-white border border-white rounded-full px-3 py-1 text-sm hover:bg-white hover:text-[#063a58] transition"
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="text-white border border-white rounded-full px-3 py-1 text-sm hover:bg-white hover:text-[#063a58] transition"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modal de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#acacac66] backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmar eliminación</h2>
            <p className="mb-4 text-gray-700">
              Para eliminar este residente, escribe su nombre completo exactamente:{" "}
              {resident.fullName ?? "—"}
            </p>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring focus:ring-teal-200"
              placeholder="Nombre completo del residente"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteInput !== resident.fullName}
                className={`px-4 py-2 rounded-md text-white ${
                  deleteInput === resident.fullName
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modo edición */}
      {editMode ? (
        <form onSubmit={handleSave} className="space-y-8">

          {/* Datos Básicos */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#063a58] mb-4">Datos Básicos</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["fullName", "Nombre completo"],
                ["unitNumber", "Unidad"],
                ["status", "Estado"],
                ["email", "Email"],
                ["phone", "Teléfono"],
                ["alternatePhone", "Teléfono Alt."],
                ["moveInDate", "Fecha Entrada"],
                ["moveOutDate", "Fecha Salida"],
              ].map(([key, label]) => (
                <div key={key} className="flex flex-col">
                  <label className="text-gray-600 text-sm mb-1 uppercase">{label}</label>
                  <input
                    type={key.includes("Date") ? "date" : "text"}
                    value={(formData as any)[key] ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-teal-200"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Contacto Primario */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#063a58] mb-4">Contacto Primario</h2>
            {[
              ["name", "Nombre"],
              ["email", "Email"],
              ["phone", "Teléfono"],
            ].map(([field, label]) => (
              <div key={field} className="flex flex-col mb-4">
                <label className="text-gray-600 text-sm mb-1 uppercase">{label}</label>
                <input
                  type="text"
                  value={(formData.primaryContact as any)?.[field] ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryContact: {
                        ...((formData.primaryContact as Contact) ?? {}),
                        [field]: e.target.value,
                      },
                    })
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-teal-200"
                />
              </div>
            ))}
          </section>

          {/* Contactos de Emergencia */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#063a58]">Contactos de Emergencia</h2>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    emergencyContacts: [
                      ...((formData.emergencyContacts as Contact[]) ?? []),
                      {},
                    ],
                  })
                }
                className="text-sm text-green-600 hover:underline"
              >
                + Añadir contacto
              </button>
            </div>
            {(formData.emergencyContacts as Contact[]).map((c, i) => (
              <div key={i} className="border-t border-gray-100 pt-4 mb-4">
                {[
                  ["name", "Nombre"],
                  ["relationship", "Parentesco"],
                  ["phone", "Teléfono"],
                  ["email", "Email"],
                ].map(([field, label]) => (
                  <div key={field} className="flex flex-col mb-2">
                    <label className="text-gray-600 text-sm mb-1 uppercase">{label}</label>
                    <input
                      type="text"
                      value={(c as any)[field] ?? ""}
                      onChange={(e) => {
                        const updated = [...(formData.emergencyContacts as Contact[])];
                        (updated[i] as any)[field] = e.target.value;
                        setFormData({ ...formData, emergencyContacts: updated });
                      }}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-teal-200"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const updated = (formData.emergencyContacts as Contact[]).filter(
                      (_, idx) => idx !== i
                    );
                    setFormData({ ...formData, emergencyContacts: updated });
                  }}
                  className="text-sm text-red-600 hover:underline mt-2"
                >
                  Eliminar contacto
                </button>
              </div>
            ))}
          </section>

          {/* Información de Arrendamiento */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#063a58] mb-4">Información de Arrendamiento</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["startDate", "Inicio"],
                ["endDate", "Fin"],
                ["rentAmount", "Renta"],
                ["securityDeposit", "Depósito"],
                ["terms", "Términos"],
              ].map(([key, label]) => (
                <div key={key} className="flex flex-col">
                  <label className="text-gray-600 text-sm mb-1 uppercase">{label}</label>
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
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-teal-200"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Documentos */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#063a58]">Documentos</h2>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    documents: [...((formData.documents as DocumentInfo[]) ?? []), { type: "OTHER" }],
                  })
                }
                className="text-sm text-green-600 hover:underline"
              >
                + Añadir doc
              </button>
            </div>
            {(formData.documents as DocumentInfo[]).map((d, i) => (
              <div key={i} className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex gap-4 mb-2">
                  <select
                    value={d.type}
                    onChange={(e) => {
                      const updated = [...(formData.documents as DocumentInfo[])];
                      updated[i].type = e.target.value as DocumentInfo["type"];
                      setFormData({ ...formData, documents: updated });
                    }}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-teal-200"
                  >
                    <option value="ID">ID</option>
                    <option value="LEASE">LEASE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                  <input
                    type="text"
                    placeholder="URL"
                    value={d.url ?? ""}
                    onChange={(e) => {
                      const updated = [...(formData.documents as DocumentInfo[])];
                      updated[i].url = e.target.value;
                      setFormData({ ...formData, documents: updated });
                    }}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-teal-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = (formData.documents as DocumentInfo[]).filter(
                      (_, idx) => idx !== i
                    );
                    setFormData({ ...formData, documents: updated });
                  }}
                  className="text-sm text-red-600 hover:underline"
                >
                  Eliminar doc
                </button>
              </div>
            ))}
          </section>

        </form>
      ) : (
        <>
          {/* Información General */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 text-[#063a58]" />
              <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Información General</h2>
            </div>
            {renderRows([
              ["Email", resident.email ?? "—"],
              ["Teléfono", resident.phone ?? "—"],
              ["Teléfono Alt.", resident.alternatePhone ?? "—"],
              ["Fecha Entrada", resident.moveInDate ?? "—"],
              ["Fecha Salida", resident.moveOutDate ?? "—"],
            ])}
          </section>

          {/* Contactos */}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <InformationCircleIcon className="h-5 w-5 text-[#063a58]" />
                <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Contacto Primario</h2>
              </div>
              {renderRows([
                ["Nombre", resident.primaryContact?.name ?? "—"],
                ["Email", resident.primaryContact?.email ?? "—"],
                ["Teléfono", resident.primaryContact?.phone ?? "—"],
              ])}
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <InformationCircleIcon className="h-5 w-5 text-[#063a58]" />
                <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Contactos de Emergencia</h2>
              </div>
              {emergency.map((c, i) => (
                <div key={c.id ?? i} className={i > 0 ? "mt-4 pt-4 border-t border-gray-100" : ""}>
                  {renderRows([
                    ["Nombre", c.name ?? "—"],
                    ["Parentesco", c.relationship ?? "—"],
                    ["Teléfono", c.phone ?? "—"],
                    ["Email", c.email ?? "—"],
                  ])}
                </div>
              ))}
            </section>
          </div>

          {/* Arrendamiento y Estadísticas */}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <CurrencyDollarIcon className="h-5 w-5 text-[#063a58]" />
                <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Información de Arrendamiento</h2>
              </div>
              {renderRows([
                ["Inicio", resident.lease?.startDate ?? "—"],
                ["Fin", resident.lease?.endDate ?? "—"],
                ["Renta", `${resident.lease?.rentAmount ?? 0} MXN`],
                ["Depósito", `${resident.lease?.securityDeposit ?? 0} MXN`],
                ["Términos", resident.lease?.terms ?? "—"],
              ])}
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <TagIcon className="h-5 w-5 text-[#063a58]" />
                <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Estadísticas</h2>
              </div>
              {renderRows([
                ["Pagos Totales", resident.statistics?.totalPayments ?? 0],
                ["Total Pagado", `${resident.statistics?.totalPaid ?? 0} MXN`],
                ["Retraso Prom. (días)", resident.statistics?.avgPaymentDelayDays ?? 0],
                ["Último Pago", resident.statistics?.lastPaymentDate ?? "—"],
                ["Solicitudes Mto.", resident.statistics?.maintenanceRequests ?? 0],
                ["Saldo Adeudado", `${resident.statistics?.balanceOwed ?? 0} MXN`],
              ])}
            </section>
          </div>

          {/* Documentos */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="h-5 w-5 text-[#063a58]" />
              <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Documentos</h2>
            </div>
            <ul className="space-y-2 text-sm">
              {documents.map((d) => (
                <li key={d.id}>
                  <a
                    href={d.url ?? "#"}
                    target="_blank"
                    className="text-green-600 hover:underline"
                  >[{d.type}] {d.url ?? "—"}</a>
                </li>
              ))}
            </ul>
          </section>

          {/* Historial de Pagos */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <EnvelopeIcon className="h-5 w-5 text-[#063a58]" />
              <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Historial de Pagos</h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
              <input
                type="text"
                placeholder="Buscar pagos..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-teal-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="mt-2 sm:mt-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-teal-200"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Todos</option>
                {Array.from(new Set(payments.map((p) => p.status))).map((st) => (
                  <option key={st} value={st ?? ""}>{st ?? "—"}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto border-t border-gray-100">
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-left text-gray-600 uppercase">
                      <th className="py-2 px-4">Fecha</th>
                      <th className="py-2 px-4">Categoría</th>
                      <th className="py-2 px-4">Método</th>
                      <th className="py-2 px-4">Monto Neto</th>
                      <th className="py-2 px-4">Estado</th>
                      <th className="py-2 px-4">Factura</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4">{p.paymentDate?.split("T")[0] ?? "—"}</td>
                        <td className="py-2 px-4">{p.category?.name ?? "—"}</td>
                        <td className="py-2 px-4">{p.method ?? "—"}</td>
                        <td className="py-2 px-4">{p.netAmount ?? 0} MXN</td>
                        <td className="py-2 px-4">{p.status ?? "—"}</td>
                        <td className="py-2 px-4">
                          <a href={p.invoiceUrl ?? "#"} target="_blank" className="text-green-600 hover:underline">
                            Ver
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Sección de Reservas */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <CalendarDaysIcon className="h-5 w-5 text-[#063a58]" />
              <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Reservas</h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
              <input
                type="text"
                placeholder="Buscar reservas..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-teal-200"
                value={reservationSearch}
                onChange={(e) => setReservationSearch(e.target.value)}
              />
              <select
                className="mt-2 sm:mt-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-teal-200"
                value={reservationStatusFilter}
                onChange={(e) => setReservationStatusFilter(e.target.value)}
              >
                <option value="ALL">Todos</option>
                {Array.from(new Set(reservations.map((r) => r.status))).map((st) => (
                  <option key={st} value={st ?? ""}>{st ?? "—"}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto border-t border-gray-100">
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-left text-gray-600 uppercase">
                      <th className="py-2 px-4">Inicio</th>
                      <th className="py-2 px-4">Fin</th>
                      <th className="py-2 px-4">Estado</th>
                      <th className="py-2 px-4">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReservations.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4">{r.startTime?.split("T")[0] ?? "—"}</td>
                        <td className="py-2 px-4">{r.endTime?.split("T")[0] ?? "—"}</td>
                        <td className="py-2 px-4">{r.status ?? "—"}</td>
                        <td className="py-2 px-4">{r.remarks ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
