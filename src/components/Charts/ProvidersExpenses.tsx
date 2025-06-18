// components/ProviderExpenses.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { getProviderExpenses } from '../..//utils/api';

interface ProviderExpense {
  id: string;
  providerName: string;
  totalAmount: number;
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
  // Fecha actual en formato YYYY-MM
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  // Fecha por defecto: un mes antes de currentMonth
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const defaultStart = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

  const [startMonth, setStartMonth] = useState<string>(defaultStart);
  const [endMonth, setEndMonth] = useState<string>(currentMonth);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [expenses, setExpenses] = useState<ProviderExpense[]>(data);

  // Fetch cuando autoFetch = true y cambian las fechas
  useEffect(() => {
    if (!autoFetch) return;

    async function fetchData() {
      setLoading(true);
      try {
        // Formatear fechas para API: primer día y último día del mes
        const startDate = `${startMonth}-01`;
        const [y, m] = startMonth.split('-').map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        const endDate = `${endMonth}-` + String(
          Math.min(lastDay, new Date(endMonth).getDate() || lastDay)
        ).padStart(2, '0');

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

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-normal text-gray-800 mb-2">Gastos por proveedor</h2>
      <p className='text-gray-600 mb-4'>Indetifica pagos a tus provedores de manera rapida a traves del timepo</p>

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
        <ul className="space-y-1">
          {expenses.map(({ id, providerName, totalAmount }) => (
            <li key={id} className="flex justify-between">
              <span>{providerName}</span>
              <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded">
                ${totalAmount.toFixed(2)}
              </span>
            </li>
          ))}
          {expenses.length === 0 && (
            <li className="text-gray-500 text-sm">Sin datos disponibles.</li>
          )}
        </ul>
      )}
    </div>
  );
}
