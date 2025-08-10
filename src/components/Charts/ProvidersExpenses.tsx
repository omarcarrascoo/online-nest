"use client";

import React, { useState, useEffect } from 'react';
import { getProviderExpenses } from '../../utils/api';

interface ProviderInfo {
  id: string;
  name: string;
  legalName: string;
}

interface ServiceCategory {
  id: string;
  name: string;
}

interface ProviderExpense {
  id: string;
  provider?: ProviderInfo;
  serviceCategory?: ServiceCategory;
  netAmount: number;
  expenseDate: string;
}

interface ProviderExpensesProps {
  /** Si es true, el componente hará fetch automáticamente */
  autoFetch?: boolean;
  /** Datos pre-cargados si autoFetch = false */
  data?: ProviderExpense[];
}

export default function ProviderExpenses({
  autoFetch = false,
  data = [],
}: ProviderExpensesProps) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const defaultStart = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

  const [startMonth, setStartMonth] = useState(defaultStart);
  const [endMonth, setEndMonth] = useState(currentMonth);
  const [loading, setLoading] = useState(autoFetch);
  const [expenses, setExpenses] = useState<ProviderExpense[]>(data);

  useEffect(() => {
    if (!autoFetch) return;

    async function fetchData() {
      setLoading(true);
      try {
        const startDate = `${startMonth}-01`;
        const [y, m] = startMonth.split('-').map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        const [ey, em] = endMonth.split('-').map(Number);
        const endDay = new Date(ey, em, 0).getDate();
        const endDate = `${endMonth}-${String(endDay).padStart(2, '0')}`;

        const fetched = await getProviderExpenses(startDate, endDate);
        setExpenses(fetched);
      } catch (err) {
        console.error("Error cargando gastos de proveedores:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [autoFetch, startMonth, endMonth]);

  console.log(expenses, "ProviderExpenses");

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg text-gray-800 mb-2">Gastos por proveedor</h2>
      <p className="text-gray-600 mb-4">
        Listado de gastos organizados por proveedor y categoría
      </p>

      {autoFetch && (
        <div className="flex space-x-2 items-center mb-4">
          <label className="text-xs text-gray-500 flex flex-col">
            Desde:
            <input
              type="month"
              max={currentMonth}
              value={startMonth}
              onChange={e => setStartMonth(e.target.value)}
              className="mt-1 p-1 border rounded"
            />
          </label>
          <label className="text-xs text-gray-500 flex flex-col">
            Hasta:
            <input
              type="month"
              max={currentMonth}
              value={endMonth}
              onChange={e => setEndMonth(e.target.value)}
              className="mt-1 p-1 border rounded"
            />
          </label>
        </div>
      )}

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <ul className="space-y-6 overflow-y-auto max-h-120"> {/* Contenedor scrollable */}
          {expenses.length > 0 ? (
            expenses.map(exp => {
              const providerName = exp.provider?.legalName ?? "Proveedor desconocido";
              const categoryName = exp.serviceCategory?.name ?? "Categoría desconocida";
              const dateStr = new Date(exp.expenseDate).toLocaleDateString();
              return (
                <li
                  key={exp.id}
                  className="flex justify-between items-center px-2 py-1 border-b last:border-none"
                >
                  <div>
                    <span className="font-medium text-gray-800">{providerName}</span>
                    <div className="text-xs text-gray-500">
                      {categoryName} · {dateStr}
                    </div>
                  </div>
                  <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded">
                    ${exp.netAmount?exp.netAmount.toFixed(2) : 'error en el registro'}
                  </span>
                </li>
              );
            })
          ) : (
            <li className="text-gray-500 text-sm">Sin datos disponibles.</li>
          )}
        </ul>
      )}
    </div>
  );
}
