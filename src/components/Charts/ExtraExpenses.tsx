// components/ExtraExpenses.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { getExtraExpenses } from '../../utils/api';

interface ExtraExpense {
  id: string;
  concept: string;
  amount: number;
  date: string;
}

interface ExtraExpensesProps {
  /** Si es true, el componente hará fetch automáticamente */
  autoFetch?: boolean;
  /** Datos pre-cargados si autoFetch = false */
  data?: ExtraExpense[];
}

export default function ExtraExpenses({
  autoFetch = false,
  data = [],
}: ExtraExpensesProps) {
  // Fecha actual en formato YYYY-MM
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  // Fecha por defecto: un mes antes de currentMonth
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const defaultStart = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

  const [startMonth, setStartMonth] = useState<string>(defaultStart);
  const [endMonth, setEndMonth] = useState<string>(currentMonth);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [expenses, setExpenses] = useState<ExtraExpense[]>(data);

  // Fetch cuando autoFetch = true y cambian las fechas
  useEffect(() => {
    if (!autoFetch) return;

    async function fetchData() {
      setLoading(true);
      try {
        // Primer día del mes de inicio
        const startDate = `${startMonth}-01`;
        // Último día del mes de fin
        const [y, m] = endMonth.split('-').map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        const endDate = `${endMonth}-${String(lastDay).padStart(2, '0')}`;

        const fetched = await getExtraExpenses(startDate, endDate);
        setExpenses(fetched);
      } catch (err) {
        console.error("Error cargando gastos extraordinarios:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [autoFetch, startMonth, endMonth]);

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h4 className="text-sm text-gray-600 mb-2">Gastos extraordinarios</h4>

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
        <ul className="border-l border-gray-300 pl-4 space-y-4">
          {expenses.map(({ id, concept, amount, date }) => (
            <li key={id}>
              <p className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</p>
              <p className="font-semibold">{concept}</p>
              <p className="text-sm text-red-500">${amount.toFixed(2)}</p>
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
