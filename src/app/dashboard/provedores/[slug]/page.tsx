// src/app/dashboard/providers/[id]/page.tsx

"use client";

import React, { useState, useEffect, JSX, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "../../../../utils/api";
import {
  BuildingOffice2Icon,
  ClipboardDocumentIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TagIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface ServiceType { name: string }
interface ContactInfo {
  contactName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  regionsServed?: string[];
}
interface ContractInfo {
  startDate?: string;
  endDate?: string | null;
  paymentTerms?: string;
  currency?: string;
  rfc?: string;
  bankAccount?: string;
}
interface DocumentInfo { id?: string; type?: string; url?: string }
interface StatisticInfo {
  totalServices?: number;
  totalSpend?: number;
  avgCostPerService?: number;
  avgRating?: number;
  onTimeRate?: number;
  avgResponseTimeHrs?: number;
  lastServiceDate?: string;
  delayRate?: number;
  pendingInvoices?: number;
}
interface Expense {
  id: string;
  serviceCategory?: { name?: string };
  totalAmount?: number;
  expenseDate?: string;
}

interface Provider {
  id: string;
  name?: string;
  legalName?: string;
  serviceType?: ServiceType | null;
  contact?: ContactInfo | null;
  contract?: ContractInfo;
  documents?: DocumentInfo[];
  statistics?: StatisticInfo;
  expenses?: Expense[];
  isActive?: boolean;
  tags?: string[];
  internalNotes?: string;
  providerCreated?: string;
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

export default function ProviderPage({ params }: { params: { id: string } }): JSX.Element {
  const { id } = params;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Provider>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  console.log("Provider ID:", id);
  
  console.log(provider);
  
  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      try {
        setProvider(JSON.parse(atob(dataParam)));
        setLoading(false);
        return;
      } catch {}
    }
    apiClient.get<Provider>(`/providers/${id}`)
      .then(res => setProvider(res.data))
      .finally(() => setLoading(false));
  }, [id, searchParams]);

  if (loading || !provider) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center text-gray-600">
        Cargando proveedor…
      </div>
    );
  }

  const expenses = provider.expenses ?? [];
  const documents = provider.documents ?? [];
  const stats = provider.statistics ?? {};

  const handleEdit = () => {
    setFormData(provider);
    setEditMode(true);
  };
  const handleCancelEdit = () => setEditMode(false);
  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    apiClient.put(`/providers/${id}`, formData).then(res => {
      setProvider(res.data);
      setEditMode(false);
    }).catch(() => alert("Error al guardar"));
  };
  const openDeleteModal = () => { setDeleteInput(""); setShowDeleteModal(true); };
  const closeDeleteModal = () => setShowDeleteModal(false);
  const confirmDelete = () => {
    apiClient.delete(`/providers/${id}`)
      .then(() => router.push("/dashboard/providers"))
      .catch(() => alert("Error al eliminar"));
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <header>
        <div className="flex items-center justify-between bg-gradient-to-r from-[#063a58] via-teal-700 to-[#1b3d50] rounded-md px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {provider.name}
            </h1>
            <p className="mt-1 text-white text-sm">
              {provider.legalName}
            </p>
          </div>
          <div className="flex gap-2">
            {!editMode ? (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1 text-white border border-white rounded-full px-3 py-1 text-sm hover:bg-white hover:text-[#063a58] transition"
                >
                  <PencilIcon className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={openDeleteModal}
                  className="flex items-center gap-1 text-white border border-white rounded-full px-3 py-1 text-sm hover:bg-white hover:text-[#063a58] transition"
                >
                  <TrashIcon className="w-4 h-4" /> Eliminar
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
                  onClick={handleCancelEdit}
                  className="text-white border border-white rounded-full px-3 py-1 text-sm hover:bg-white hover:text-[#063a58] transition"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmar eliminación</h2>
            <p className="mb-4 text-gray-700">
              Escribe el nombre exacto para confirmar: <strong>{provider.name}</strong>
            </p>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-teal-200 focus:ring outline-none"
              placeholder="Nombre del proveedor"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteInput !== provider.name}
                className={`px-4 py-2 rounded-md text-white ${
                  deleteInput === provider.name ? "bg-red-600 hover:bg-red-700" : "bg-red-300 cursor-not-allowed"
                }`}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Mode */}
      {!editMode && (
        <>
          {/* General */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <BuildingOffice2Icon className="h-5 w-5 text-[#063a58]" />
              <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Información General</h2>
            </div>
            {renderRows([
              ["Tipo servicio", provider.serviceType?.name ?? "—"],
              ["Activo", provider.isActive ? "Sí" : "No"],
              ["Creado", provider.providerCreated?.split("T")[0] ?? "—"],
            ])}
          </section>

          {/* Contact */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 text-[#063a58]" />
              <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Contacto</h2>
            </div>
            {renderRows([
              ["Nombre", provider.contact?.contactName ?? "—"],
              ["Email", provider.contact?.email ?? "—"],
              ["Teléfono", provider.contact?.phone ?? "—"],
              ["Dirección", provider.contact?.address ?? "—"],
              ["Sitio web", provider.contact?.website ?? "—"],
              ["Regiones", (provider.contact?.regionsServed ?? []).join(", ") || "—"],
            ])}
          </section>

          {/* Contract */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <ClipboardDocumentIcon className="h-5 w-5 text-[#063a58]" />
              <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Contrato</h2>
            </div>
            {renderRows([
              ["Inicio", provider.contract?.startDate ?? "—"],
              ["Fin", provider.contract?.endDate ?? "—"],
              ["Términos pago", provider.contract?.paymentTerms ?? "—"],
              ["Moneda", provider.contract?.currency ?? "—"],
              ["RFC", provider.contract?.rfc ?? "—"],
              ["Cuenta bancaria", provider.contract?.bankAccount ?? "—"],
            ])}
          </section>

          {/* Statistics */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-5 w-5 text-[#063a58]" />
              <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Estadísticas</h2>
            </div>
            {renderRows([
              ["Servicios totales", stats.totalServices ?? 0],
              ["Gasto total", `${stats.totalSpend ?? 0} USD`],
              ["Costo medio", `${stats.avgCostPerService ?? 0} USD`],
              ["Rating medio", stats.avgRating ?? 0],
              ["On-time rate", `${stats.onTimeRate ?? 0}%`],
              ["Resp. hrs", stats.avgResponseTimeHrs ?? 0],
              ["Último servicio", stats.lastServiceDate ?? "—"],
              ["Delay rate", `${stats.delayRate ?? 0}%`],
              ["Pend. facturas", stats.pendingInvoices ?? 0],
            ])}
          </section>

          {/* Documents */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="h-5 w-5 text-[#063a58]" />
              <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Documentos</h2>
            </div>
            <ul className="space-y-2 text-sm">
              {documents.map(d => (
                <li key={d.id}>
                  <a href={d.url} target="_blank" className="text-green-600 hover:underline">
                    [{d.type}] {d.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Expenses */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <BanknotesIcon className="h-5 w-5 text-[#063a58]" />
              <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Gastos Recientes</h2>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 text-sm">
              {expenses.map(e => (
                <div key={e.id} className="py-2 flex justify-between">
                  <span>{e.expenseDate?.split("T")[0] ?? "—"}</span>
                  <span>{e.serviceCategory?.name ?? "—"}</span>
                  <span>{e.totalAmount ?? 0} USD</span>
                </div>
              ))}
            </div>
          </section>

          {/* Tags & Notes */}
          {(provider.tags?.length || provider.internalNotes) && (
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <TagIcon className="h-5 w-5 text-[#063a58]" />
                <h2 className="ml-2 text-lg font-semibold text-[#063a58]">Extras</h2>
              </div>
              {(provider.tags ?? []).length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {(provider.tags ?? []).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {provider.internalNotes && (
                <p className="text-gray-600 text-sm">{provider.internalNotes}</p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
