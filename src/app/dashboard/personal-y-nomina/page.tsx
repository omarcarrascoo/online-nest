"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "../../../utils/api";
import { SearchIcon, PlusIcon, EyeIcon } from "lucide-react";
import { GradientButton } from "@/components/buttons/GradientButton";

type Employee = {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
  type: string;
  salary?: {
    baseSalary?: number;
    frequency?: string;
  };
  isActive: boolean;
};

export default function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    apiClient
      .get("/employees")
      .then((res) => {
        // Por si la API respondiera null o un objeto inesperado:
        const data = Array.isArray(res.data) ? res.data : [];
        setEmployees(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredEmployees = employees.filter((e) => {
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
    const email = e.email?.toLowerCase() ?? "";
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || email.includes(term);
  });

  if (loading) {
    return <div className="p-4 text-center">Cargando…</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h2 className="text-3xl font-semibold text-[#063a58]">Empleados</h2>
        <div className="flex gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar empleados..."
              className="border border-gray-200 rounded-full shadow-sm pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-300 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <GradientButton href="/dashboard/personal-y-nomina/agregar">
              <PlusIcon className="w-4 h-4" /> Agregar
          </GradientButton>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-md bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600 uppercase">
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Teléfono</th>
              <th className="py-3 px-4">Contratación</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Salario</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Acción</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-400">
                  No se encontraron resultados
                </td>
              </tr>
            )}

            {filteredEmployees.map((emp) => {
              // Desestructuramos con valores por defecto
              const baseSalary = emp.salary?.baseSalary ?? 0;
              const frequency = emp.salary?.frequency ?? "-";
              return (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="py-8 px-4 font-medium text-gray-800">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{emp.email}</td>
                  <td className="py-3 px-4 text-gray-600">{emp.phone}</td>
                  <td className="py-3 px-4 text-gray-600">{emp.hireDate}</td>
                  <td className="py-3 px-4 text-gray-600">{emp.type}</td>
                  <td className="py-3 px-4 text-gray-600">
                    ${baseSalary.toFixed(2)} / {frequency}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        emp.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {emp.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/employees/${emp.id}`}
                      className="text-green-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <EyeIcon className="w-4 h-4" /> Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
