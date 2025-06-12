"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Tooltip, Legend,
  XAxis, BarChart, Bar,
} from 'recharts';
import {
  getMonthlyBalance,
  getIncomeExpense,
  getAnnualSummary,
  getDelinquency,
  getCollection,
  getBudgetVsActual,
  getReserveFund,
  getProviderExpenses,
  getExtraExpenses,
} from '../../../utils/api';

export default function Home() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const todayISO = today.toISOString().split('T')[0];
  const todayMonth = `${yyyy}-${mm}`;
  const sixMonthsAgo = new Date(yyyy, today.getMonth() - 5, 1);
  const defaultStartMonth = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

  // --- State for all date selectors ---
  const [startMonth, setStartMonth] = useState(defaultStartMonth);
  const [endMonth, setEndMonth] = useState(todayMonth);

  const [annualStartDate, setAnnualStartDate] = useState(`${yyyy}-01-01`);
  const [annualEndDate, setAnnualEndDate] = useState(todayISO);

  const [collectionStart, setCollectionStart] = useState(`${yyyy}-01-01`);
  const [collectionEnd, setCollectionEnd] = useState(todayISO);

  const [budgetYear, setBudgetYear] = useState(String(yyyy));

  const [providerStart, setProviderStart] = useState(`${yyyy}-01-01`);
  const [providerEnd, setProviderEnd] = useState(todayISO);

  const [extraStart, setExtraStart] = useState(`${yyyy}-01-01`);
  const [extraEnd, setExtraEnd] = useState(todayISO);

  // --- Report data states ---
  const [loading, setLoading] = useState(true);
  const [monthlyBalances, setMonthlyBalances] = useState([]);
  const [incomeExpenseData, setIncomeExpenseData] = useState([]);
  const [annualSummary, setAnnualSummary] = useState(null);
  const [delinquentHomes, setDelinquentHomes] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [budgetVsActualData, setBudgetVsActualData] = useState([]);
  const [reserveFundData, setReserveFundData] = useState([]);
  const [providerExpensesData, setProviderExpensesData] = useState([]);
  const [extraExpensesData, setExtraExpensesData] = useState([]);

  // Helper: format "YYYY-MM" to "Mon YYYY"
  const formatMonthYear = ym => {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  // Fetch monthly balances for selected 6-month range
  const fetchBalanceData = useCallback(async () => {
    const [sy, sm] = startMonth.split('-').map(Number);
    const [ey, em] = endMonth.split('-').map(Number);
    const months = [];
    let y = sy, m = sm;
    while (y < ey || (y === ey && m <= em)) {
      months.push({ year: y, month: m });
      m += 1;
      if (m > 12) { m = 1; y += 1; }
    }
    const res = await Promise.all(
      months.map(async ({ year, month }) => {
        const d = await getMonthlyBalance(month, year);
        return { ...d, year, month };
      })
    );
    setMonthlyBalances(res);
  }, [startMonth, endMonth]);

  // Initial load and reload on any selector change
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
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
          getIncomeExpense(annualStartDate, annualEndDate),
          getDelinquency(),
          getCollection(collectionStart, collectionEnd),
          getBudgetVsActual(Number(budgetYear)),
          getAnnualSummary(Number(budgetYear)),
          getReserveFund(),
          getProviderExpenses(providerStart, providerEnd),
          getExtraExpenses(extraStart, extraEnd),
        ]);

        setIncomeExpenseData(ie.payments);
        setDelinquentHomes(del.fines);
        setCollectionData(col);
        setBudgetVsActualData(bva);
        setAnnualSummary(asu);
        setReserveFundData(rf);
        setProviderExpensesData(pe);
        setExtraExpensesData(ee);

        await fetchBalanceData();
      } catch (err) {
        console.error('Error loading reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [
    annualStartDate, annualEndDate,
    collectionStart, collectionEnd,
    budgetYear,
    providerStart, providerEnd,
    extraStart, extraEnd,
    fetchBalanceData
  ]);

  if (loading) return <div>Cargando...</div>;

  // Prepare pie data and improve label layout
  const pieData = annualSummary
    ? [
        { name: 'Ingresos', value: annualSummary.incomes },
        { name: 'Egresos', value: annualSummary.expenses },
      ]
    : [];

  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>

      {/* BALANCE ANUAL */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Balance Anual</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Desde:</label>
          <input
            type="date"
            max={todayISO}
            value={annualStartDate}
            onChange={e => setAnnualStartDate(e.target.value)}
            className="border rounded p-1"
          />
          <label className="text-sm text-gray-600">Hasta:</label>
          <input
            type="date"
            max={todayISO}
            value={annualEndDate}
            onChange={e => setAnnualEndDate(e.target.value)}
            className="border rounded p-1"
          />
          <label className="text-sm text-gray-600 ml-4">Año (para resumen):</label>
          <input
            type="number"
            min="2000"
            max={yyyy}
            value={budgetYear}
            onChange={e => setBudgetYear(e.target.value)}
            className="border rounded p-1 w-20"
          />
        </div>
        <p className="text-sm text-gray-600">
          Totales de ingresos y egresos en el periodo y año seleccionados. Compara años y analiza tendencias anuales.
        </p>
        {annualSummary && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl text-center shadow">
              <h3 className="text-gray-500 text-sm">Ingresos</h3>
              <p className="font-bold text-lg">${annualSummary.incomes}</p>
            </div>
            <div className="bg-white p-4 rounded-xl text-center shadow">
              <h3 className="text-gray-500 text-sm">Egresos</h3>
              <p className="font-bold text-lg">${annualSummary.expenses}</p>
            </div>
            <div className="bg-white p-4 rounded-xl text-center shadow">
              <h3 className="text-gray-500 text-sm">Balance Neto</h3>
              <p className="font-bold text-lg">
                ${(annualSummary.incomes - annualSummary.expenses).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* INGRESOS vs EGRESOS (PIE) */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Ingresos vs Egresos</h2>
        <p className="text-sm text-gray-600 mb-4">
          Distribución porcentual entre ingresos y egresos para el año seleccionado.
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              labelLine={false}
              label={{ position: 'outside', fontSize: 12 }}
            />
            <Tooltip />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* BALANCE MENSUAL */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Balance Mensual del Fraccionamiento</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Desde:</label>
          <input
            type="month"
            max={todayMonth}
            value={startMonth}
            onChange={e => setStartMonth(e.target.value)}
            className="border rounded p-1"
          />
          <label className="text-sm text-gray-600">Hasta:</label>
          <input
            type="month"
            max={todayMonth}
            value={endMonth}
            onChange={e => setEndMonth(e.target.value)}
            className="border rounded p-1"
          />
        </div>
        <p className="text-sm text-gray-600">
          Total de ingresos, gastos y saldo neto mes a mes en el rango seleccionado.
        </p>
        <div className="bg-white p-4 rounded-xl shadow">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={monthlyBalances.map(({ year, month, balance }) => ({
                month: new Date(year, month - 1)
                  .toLocaleString('default', { month: 'short' }),
                balance
              }))}
            >
              <XAxis dataKey="month" />
              <Tooltip />
              <Line type="monotone" dataKey="balance" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* RECAUDACIÓN */}
      <section className="bg-white p-4 rounded-xl shadow space-y-2">
        <h2 className="text-xl font-semibold">Recaudación</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Desde:</label>
          <input
            type="date"
            max={todayISO}
            value={collectionStart}
            onChange={e => setCollectionStart(e.target.value)}
            className="border rounded p-1"
          />
          <label className="text-sm text-gray-600">Hasta:</label>
          <input
            type="date"
            max={todayISO}
            value={collectionEnd}
            onChange={e => setCollectionEnd(e.target.value)}
            className="border rounded p-1"
          />
        </div>
        <p className="text-sm text-gray-600">
          Detalle de los cobros realizados en el periodo seleccionado.
        </p>
        <ul className="space-y-1">
          {collectionData.map(({ id, paymentDate, amount }) => (
            <li key={id} className="flex justify-between">
              <span>{new Date(paymentDate).toLocaleDateString()}</span>
              <span className="font-semibold">${amount}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* PRESUPUESTO VS REAL */}
      <section className="bg-white p-4 rounded-xl shadow space-y-2">
        <h2 className="text-xl font-semibold">Presupuesto vs Real</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Año:</label>
          <input
            type="number"
            min="2000"
            max={yyyy}
            value={budgetYear}
            onChange={e => setBudgetYear(e.target.value)}
            className="border rounded p-1 w-20"
          />
        </div>
        <p className="text-sm text-gray-600">
          Comparación de presupuesto planificado frente al gasto real por categoría.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="px-2 py-1 text-gray-500 text-sm">Categoría</th>
                <th className="px-2 py-1 text-gray-500 text-sm">Presupuesto</th>
                <th className="px-2 py-1 text-gray-500 text-sm">Real</th>
              </tr>
            </thead>
            <tbody>
              {budgetVsActualData.map(({ category, budget, actual }) => (
                <tr key={category} className="border-b">
                  <td className="px-2 py-1">{category}</td>
                  <td className="px-2 py-1 font-semibold">${budget}</td>
                  <td className="px-2 py-1 font-semibold">${actual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MOROSIDAD */}
      <section className="bg-white p-4 rounded-xl shadow space-y-2">
        <h2 className="text-xl font-semibold">Morosidad</h2>
        <p className="text-sm text-gray-600">
          Listado de domicilios con multas pendientes.
        </p>
        <ul className="space-y-1">
          {delinquentHomes.map(({ id, description, amount }) => (
            <li key={id} className="flex justify-between">
              <span>{description}</span>
              <span className="font-semibold text-red-500">${amount}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* FONDO DE RESERVA */}
      <section className="bg-white p-4 rounded-xl shadow space-y-2">
        <h2 className="text-xl font-semibold">Fondo de Reserva</h2>
        <p className="text-sm text-gray-600">
          Porcentaje acumulado del fondo de reserva.
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full"
            style={{
              width: `${
                (
                  reserveFundData.reduce(
                    (acc, curr:any) =>
                      curr.type === 'INCOME' ? acc + curr.amount : acc - curr.amount,
                    0
                  ) /
                  reserveFundData.reduce((sum, curr:any) => sum + curr.amount, 0) *
                  100
                ).toFixed(0)
              }%`
            }}
          />
        </div>
      </section>

      {/* GASTOS POR PROVEEDOR */}
      <section className="bg-white p-4 rounded-xl shadow space-y-2">
        <h2 className="text-xl font-semibold">Gastos por proveedor</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Desde:</label>
          <input
            type="date"
            max={todayISO}
            value={providerStart}
            onChange={e => setProviderStart(e.target.value)}
            className="border rounded p-1"
          />
          <label className="text-sm text-gray-600">Hasta:</label>
          <input
            type="date"
            max={todayISO}
            value={providerEnd}
            onChange={e => setProviderEnd(e.target.value)}
            className="border rounded p-1"
          />
        </div>
        <p className="text-sm text-gray-600">
          Total de gastos desglosados por proveedor en el periodo seleccionado.
        </p>
        <ul className="space-y-1">
          {providerExpensesData.map(({ id, providerName, totalAmount }) => (
            <li key={id} className="flex justify-between">
              <span>{providerName}</span>
              <span className="font-semibold">${totalAmount}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* GASTOS EXTRAORDINARIOS */}
      <section className="bg-white p-4 rounded-xl shadow space-y-2">
        <h2 className="text-xl font-semibold">Gastos extraordinarios</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Desde:</label>
          <input
            type="date"
            max={todayISO}
            value={extraStart}
            onChange={e => setExtraStart(e.target.value)}
            className="border rounded p-1"
          />
          <label className="text-sm text-gray-600">Hasta:</label>
          <input
            type="date"
            max={todayISO}
            value={extraEnd}
            onChange={e => setExtraEnd(e.target.value)}
            className="border rounded p-1"
          />
        </div>
        <p className="text-sm text-gray-600">
          Registro de gastos no recurrentes en el periodo seleccionado.
        </p>
        <ul className="border-l border-gray-300 pl-4 space-y-4">
          {extraExpensesData.map(({ id, concept, amount, date }) => (
            <li key={id}>
              <p className="text-sm text-gray-500">
                {new Date(date).toLocaleDateString()}
              </p>
              <p className="font-semibold">{concept}</p>
              <p className="text-sm text-red-500">${amount}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
