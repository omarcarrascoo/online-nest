/* src/components/ReserveFund.jsx */

"use client";
import React, { useState, useEffect } from 'react';
import { getReserveFund } from '../../utils/api';

/**
 * ReserveFund component displays breakdown and usage bar for the reserve fund data.
 * If `autoFetch` is true, it fetches its own data.
 * Otherwise, it uses the `data` prop passed from parent.
 */
export default function ReserveFund({ data: propData = [], autoFetch = false }) {
  const [data, setData] = useState(propData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autoFetch) {
      setLoading(true);
      getReserveFund()
        .then((fetched:any) => {
          setData(fetched);
        })
        .catch((err:any) => console.error('Error fetching reserve fund:', err))
        .finally(() => setLoading(false));
    }
  }, [autoFetch]);

  // Data used: either fetched or passed via props
  const fundData = autoFetch ? data : propData;

  // Calculate totals
  const totalIncome = fundData
    .filter((item:any) => item.type === 'INCOME')
    .reduce((sum, item:any) => sum + item.amount, 0);
  const totalExpense = fundData
    .filter((item:any) => item.type === 'EXPENSE')
    .reduce((sum, item:any) => sum + item.amount, 0);
  const net = totalIncome - totalExpense;
  const total = totalIncome + totalExpense;
  const percentage = total > 0 ? Math.round((net / total) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <p className="text-sm text-gray-500">Cargando fondo de reserva...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-medium mb-2">Fondo de Reserva</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Total Ingresos</p>
          <p className="font-semibold">${totalIncome.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Gastos</p>
          <p className="font-semibold text-red-500">${totalExpense.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Neto Disponible</p>
          <p className="font-semibold">${net.toLocaleString()}</p>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className="bg-green-700 h-3 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{percentage}% del fondo disponible</p>
    </div>
  );
}