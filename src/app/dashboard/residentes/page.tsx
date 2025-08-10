"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "../../../utils/api";
import { SearchIcon, PlusIcon, EyeIcon } from "lucide-react";
import { GradientButton } from "@/components/buttons/GradientButton";

interface Payment {
  id: string;
  amount: number;
  method: string;
  paymentDate: string;
}
interface Resident {
  id: string;
  fullName: string;
  unitNumber: string;
  email?: string;
  phone?: string;
  payments: Payment[];
}

export default function ResidentsTable() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiClient
      .get<Resident[]>("/residents")
      .then((res) => setResidents(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = residents.filter((r) =>
    [r.fullName, r.unitNumber, r.email ?? "", r.phone ?? ""]
      .some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      )
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h2 className="text-3xl font-semibold text-[#063a58]">Residentes</h2>
        <div className="flex gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar residentes..."
              className="border border-gray-200 rounded-full shadow-sm pl-12 pr-4 py-2 focus:ring-2 focus:ring-blue-300 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div> 
          <GradientButton href="/dashboard/residentes/add" className="flex items-center gap-1">
             <PlusIcon className="w-4 h-4" /> Agregar
          </GradientButton>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl shadow-md bg-white">
        {loading ? (
          <div className="p-4 text-center text-gray-600">Cargando…</div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600 uppercase">
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Unidad</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4"># Pagos</th>
                <th className="py-3 px-4">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">
                    No se encontraron residentes.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {r.fullName}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{r.unitNumber}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {r.email ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {r.phone ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {r.payments.length}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={{
                          pathname: `/dashboard/residentes/${r.id}`,
                          query: {
                            data: typeof window !== "undefined"
                              ? btoa(JSON.stringify(r))
                              : undefined,
                          },
                        }}
                        className="flex items-center gap-1 text-green-600 hover:text-green-800"
                      >
                        <EyeIcon className="w-4 h-4" /> Ver
                      </Link>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
