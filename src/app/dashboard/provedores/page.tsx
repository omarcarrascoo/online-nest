"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "../../../utils/api";
import {
  Cog6ToothIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  StarIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { GradientButton } from "@/components/buttons/GradientButton";

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

export function ProvidersList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    apiClient.get<Provider[]>("/providers")
      .then(res => setProviders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = providers.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.legalName ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6 text-center">Cargando…</div>;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-3">
        <h2 className="text-2xl font-bold">Proveedores</h2>
        <div className="flex gap-2">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              className="w-full pl-10 pr-3 py-1.5 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
            <GradientButton href="/dashboard/provedores/agregar">
               + Agregar
            </GradientButton>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No hay proveedores.
          </p>
        )}

        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow hover:shadow-md transition p-6 flex flex-col justify-between"
          >
            {/* Nombre */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {p.name || "Nombre sin registrar"}
              </h3>
              {p.legalName && (
                <p className="text-sm text-gray-500">{p.legalName}</p>
              )}
            </div>

            {/* Datos */}
            <div className="grid grid-cols-1 gap-y-3 text-gray-700 text-sm">
              {/* Servicio */}
              <div className="flex items-center">
                <Cog6ToothIcon strokeWidth={1} className="h-5 w-5 text-[#063a58] mr-2" />
                <span className="font-medium">Servicio:</span>
                <span className="ml-auto">
                  {p.serviceType?.name ?? "Servicio no registrado"}
                </span>
              </div>

              {/* Contrato */}
              <div className="flex items-center">
                <CalendarDaysIcon strokeWidth={1} className="h-5 w-5 text-[#063a58] mr-2" />
                <span className="font-medium">Contrato:</span>
                <span className="ml-auto">
                  {p.contract.startDate} – {p.contract.endDate ?? "Vigente"}
                </span>
              </div>

              {/* Contacto (opcional) */}
              {p.contact?.contactName && (
                <div className="flex items-center">
                  <PhoneIcon strokeWidth={1} className="h-5 w-5 text-[#063a58] mr-2" />
                  <span className="font-medium">Contacto:</span>
                  <span className="ml-auto">
                    {p.contact.contactName}
                    {p.contact.phone && ` (${p.contact.phone})`}
                  </span>
                </div>
              )}

              {/* Email (opcional) */}
              {p.contact?.email && (
                <div className="flex items-center">
                  <EnvelopeIcon strokeWidth={1} className="h-5 w-5 text-[#063a58] mr-2" />
                  <span className="font-medium">Email:</span>
                  <span className="ml-auto truncate max-w-xs">
                    {p.contact.email}
                  </span>
                </div>
              )}

              {/* Gastos */}
              <div className="flex items-center">
                <BanknotesIcon strokeWidth={1} className="h-5 w-5 text-[#063a58] mr-2" />
                <span className="font-medium">Gastos:</span>
                <span className="ml-auto">
                  ${(p.statistics?.totalSpend ?? 0).toFixed(2)}
                </span>
              </div>

              {/* Calificación */}
              <div className="flex items-center">
                <StarIcon strokeWidth={1} className="h-5 w-5 text-[#063a58] mr-2" />
                <span className="font-medium">Calificación:</span>
                <span className="ml-auto">
                  {(p.statistics?.avgRating ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  p.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {p.isActive ? "Activo" : "Inactivo"}
              </span>
              <Link
                href={`/dashboard/provedores/${p.id}`}
                onClick={() => {
                  sessionStorage.setItem("providerData", JSON.stringify(p));
                }}
                className="text-green-600 hover:underline text-sm font-medium"
              >
                Ver detalle →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProvidersPage() {
  return <ProvidersList />;
}
