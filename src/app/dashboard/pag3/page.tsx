
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import {
  getMonthlyBalance,
  getIncomeExpense,
  getDelinquency,
  getCollection,
  getBudgetVsActual,
  getAnnualSummary,
  getReserveFund,
  getProviderExpenses,
  getExtraExpenses,
} from '../../../utils/api';

export default function Home() {
  // --- Date selection state for the 6-month range ---
  const today = new Date();
  const defaultEndMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const defaultStartMonth = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

  const [startMonth, setStartMonth] = useState(defaultStartMonth);
  const [endMonth, setEndMonth] = useState(defaultEndMonth);

  // --- Report states ---
  const [loading, setLoading] = useState(true);
  const [monthlyBalances, setMonthlyBalances] = useState<
    { month: number; year: number; incomes: number; expenses: number; balance: number }[]
  >([]);
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);
  const [delinquentHomes, setDelinquentHomes] = useState<any[]>([]);
  const [collectionData, setCollectionData] = useState<any[]>([]);
  const [budgetVsActualData, setBudgetVsActualData] = useState<any[]>([]);
  const [annualSummary, setAnnualSummary] = useState<{ incomes: number; expenses: number } | null>(null);
  const [reserveFundData, setReserveFundData] = useState<any[]>([]);
  const [providerExpensesData, setProviderExpensesData] = useState<any[]>([]);
  const [extraExpensesData, setExtraExpensesData] = useState<any[]>([]);

  // Helper: format "YYYY-MM" to "Mon YYYY"
  const formatMonthYear = (ym: string) => {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  // Fetch monthly balances for each month in the selected range
  const fetchBalanceData = useCallback(async () => {
    const [sy, sm] = startMonth.split('-').map(Number);
    const [ey, em] = endMonth.split('-').map(Number);

    // build array of (year, month) pairs
    const months: { year: number; month: number }[] = [];
    let year = sy, month = sm;
    while (year < ey || (year === ey && month <= em)) {
      months.push({ year, month });
      month += 1;
      if (month > 12) { month = 1; year += 1; }
    }

    const results = await Promise.all(
      months.map(async ({ year, month }) => {
        const data = await getMonthlyBalance(month, year);
        return { ...data, year, month };
      })
    );
    setMonthlyBalances(results);
  }, [startMonth, endMonth]);

  // Initial load of all reports
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // fetch all other reports in parallel
        const [
          ie,
          del,
          col,
          bva,
          asu,
          rf,
          pe,
          ee
        ] = await Promise.all([
          getIncomeExpense('2025-01-01', '2025-07-01'),
          getDelinquency(),
          getCollection('2025-06-01', '2025-06-30'),
          getBudgetVsActual(2025),
          getAnnualSummary(2025),
          getReserveFund(),
          getProviderExpenses('2025-06-01', '2025-06-30'),
          getExtraExpenses('2025-06-01', '2025-06-30'),
        ]);

        setIncomeExpenseData(ie.payments);
        setDelinquentHomes(del.fines);
        setCollectionData(col);
        setBudgetVsActualData(bva);
        setAnnualSummary(asu);
        setReserveFundData(rf);
        setProviderExpensesData(pe);
        setExtraExpensesData(ee);

        // fetch the initial 6-month balance data
        await fetchBalanceData();
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [fetchBalanceData]);

  // Re-fetch balances whenever the user changes the date range
  useEffect(() => {
    fetchBalanceData();
  }, [fetchBalanceData]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Dashboard Administrativo Principal</h1>

      

     

      {/* Gastos por proveedor */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h4 className="text-sm text-gray-600 mb-1">Gastos por proveedor</h4>
        <ul className="space-y-1">
          {providerExpensesData.map(({ id, providerName, totalAmount }) => (
            <li key={id} className="flex justify-between">
              <span>{providerName}</span>
              <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded">
                ${totalAmount}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Gastos extraordinarios */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h4 className="text-sm text-gray-600 mb-2">Gastos extraordinarios</h4>
        <ul className="border-l border-gray-300 pl-4 space-y-4">
          {extraExpensesData.map(({ id, concept, amount, date }) => (
            <li key={id}>
              <p className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</p>
              <p className="font-semibold">{concept}</p>
              <p className="text-sm text-red-500">${amount}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}








