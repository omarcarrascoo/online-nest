"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Legend,
  Cell,
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
import Link from 'next/link';

// Custom label for pie chart to avoid overlap and round to 2 decimals
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
  name,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#333"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name}: ${value.toFixed(2)}`}
    </text>
  );
};

export default function Home() {
  const today = new Date();
  const defaultEndMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}`;
  const sixMonthsAgo = new Date(
    today.getFullYear(),
    today.getMonth() - 5,
    1
  );
  const defaultStartMonth = `${sixMonthsAgo.getFullYear()}-${String(
    sixMonthsAgo.getMonth() + 1
  ).padStart(2, '0')}`;

  const [startMonth, setStartMonth] = useState(defaultStartMonth);
  const [endMonth, setEndMonth] = useState(defaultEndMonth);

  const defaultPieMonth = defaultEndMonth;
  const [pieStartMonth, setPieStartMonth] = useState(defaultPieMonth);
  const [pieEndMonth, setPieEndMonth] = useState(defaultPieMonth);

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [loading, setLoading] = useState(true);
  const [monthlyBalances, setMonthlyBalances] = useState<
    { month: number; year: number; incomes: number; expenses: number; balance: number }[]
  >([]);
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);
  const [pieSummary, setPieSummary] = useState<{ ingresos: number; egresos: number }>({ ingresos: 0, egresos: 0 });
  const [delinquentHomes, setDelinquentHomes] = useState<any[]>([]);
  const [collectionData, setCollectionData] = useState<any[]>([]);
  const [budgetVsActualData, setBudgetVsActualData] = useState<any[]>([]);
  const [annualSummary, setAnnualSummary] = useState<{ incomes: number; expenses: number } | null>(null);
  const [reserveFundData, setReserveFundData] = useState<any[]>([]);
  const [providerExpensesData, setProviderExpensesData] = useState<any[]>([]);
  const [extraExpensesData, setExtraExpensesData] = useState<any[]>([]);

  const formatMonthYear = (ym: string) => {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  const fetchBalanceData = useCallback(async () => {
    const [sy, sm] = startMonth.split('-').map(Number);
    const [ey, em] = endMonth.split('-').map(Number);
    const months: { year: number; month: number }[] = [];
    let year = sy,
      month = sm;
    while (year < ey || (year === ey && month <= em)) {
      months.push({ year, month });
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }
    const results = await Promise.all(
      months.map(async ({ year, month }) => {
        const data = await getMonthlyBalance(month, year);
        return { ...data, year, month };
      })
    );
    setMonthlyBalances(results);
  }, [startMonth, endMonth]);

  const fetchPieSummary = useCallback(async () => {
    const [sy, sm] = pieStartMonth.split('-').map(Number);
    const [ey, em] = pieEndMonth.split('-').map(Number);
    const start = `${sy}-${String(sm).padStart(2, '0')}-01`;
    const lastDay = new Date(ey, em, 0).getDate();
    const end = `${ey}-${String(em).padStart(2, '0')}-${lastDay}`;

    const ie = await getIncomeExpense(start, end);
    setIncomeExpenseData(ie.payments || []);
    const ingresos = (ie.payments || []).reduce((sum: number, p: any) => sum + p.amount, 0);
    const pe = await getProviderExpenses(start, end);
    const ee = await getExtraExpenses(start, end);
    const egresos =
      (pe || []).reduce((sum: number, p: any) => sum + p.totalAmount, 0) +
      (ee || []).reduce((sum: number, e: any) => sum + e.amount, 0);

    setPieSummary({ ingresos, egresos });
  }, [pieStartMonth, pieEndMonth]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [del, col, bva, asu, rf, pe, ee] = await Promise.all([
          getDelinquency(),
          getCollection(`${defaultStartMonth}-01`, `${defaultEndMonth}-01`),
          getBudgetVsActual(selectedYear),
          getAnnualSummary(selectedYear),
          getReserveFund(),
          getProviderExpenses(`${defaultPieMonth}-01`, `${defaultPieMonth}-01`),
          getExtraExpenses(`${defaultPieMonth}-01`, `${defaultPieMonth}-01`),
        ]);
        setDelinquentHomes(del.fines);
        setCollectionData(col);
        setBudgetVsActualData(bva);
        setAnnualSummary(asu);
        setReserveFundData(rf);
        setProviderExpensesData(pe);
        setExtraExpensesData(ee);
        await Promise.all([fetchBalanceData(), fetchPieSummary()]);
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [fetchBalanceData, fetchPieSummary, selectedYear]);

  useEffect(() => {
    (async () => {
      const asu = await getAnnualSummary(selectedYear);
      setAnnualSummary(asu);
    })();
  }, [selectedYear]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  const COLORS = ['#417e69', '#714141'];

  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">PANEL DE ADMINISTRACION PRINCIPAL</h1>
         <p className='text-gray-600'>
              Este reporte mensual muestra el total de ingresos, gastos y el saldo neto del fraccionamiento durante el periodo seleccionado. Gracias a esta información podrás evaluar la salud financiera, identificar tendencias de consumo y optimizar la planificación de recursos para garantizar una administración eficiente y transparente.
            </p>
    <hr />

      <div className="balanceAnualTotal">
        <h2 className='mb-2 text-2xl'>BALANCE ANUAL</h2>
       <p className="mb-4 text-gray-600">
          Analiza el rendimiento anual de egresos e ingresos y compáralo con tu conciliación bancaria en   
          <Link href="/">
            <span className="text-green-600 underline"> Banca y Facturación</span>
          </Link>.
        </p>
        <div className="flex items-center space-x-2 mb-4">
          <label className="text-sm text-gray-600">Año:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded p-1"
          >
            {[...Array(5)].map((_, i) => {
              const year = today.getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
        {annualSummary && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl text-center shadow">
              <h3 className="text-gray-500 text-sm">Ingresos</h3>
              <p className="text-green-700 font-bold text-lg">
                ${annualSummary.incomes.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl text-center shadow">
              <h3 className="text-gray-500 text-sm">Egresos</h3>
              <p className="text-red-700 font-bold text-lg">
                ${annualSummary.expenses.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl text-center shadow">
              <h3 className="text-gray-500 text-sm">Balance Neto</h3>
              <p className="text-gray-700 font-bold text-lg">
                ${(annualSummary.incomes - annualSummary.expenses).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">
          Distribución: Ingresos vs Egresos
        </h2>
        <div className="flex items-center space-x-2 mb-4">
          <label className="text-sm text-gray-600">Desde:</label>
          <input
            type="month"
            value={pieStartMonth}
            onChange={(e) => setPieStartMonth(e.target.value)}
            className="border rounded p-1"
          />
          <label className="text-sm text-gray-600">Hasta:</label>
          <input
            type="month"
            value={pieEndMonth}
            onChange={(e) => setPieEndMonth(e.target.value)}
            className="border rounded p-1"
          />
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                { name: 'Ingresos', value: pieSummary.ingresos },
                { name: 'Egresos', value: pieSummary.egresos },
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {[
                { name: 'Ingresos', fill: COLORS[0] },
                { name: 'Egresos', fill: COLORS[1] },
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => value.toFixed(2)}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
        <p className="mt-2 text-sm text-gray-600">
          Este gráfico muestra en qué proporción fueron los ingresos frente a los egresos
          durante el periodo seleccionado, facilitando la comprensión de la salud financiera.
        </p>

        
      </div>

      <p className="mb-7m text-gray-600">
          Puedes revisar la lista de ingresos y egresos detallados en  
          <Link href="/">
            <span className="text-green-600 underline"> Ingresos y Egresos</span>
          </Link>.
        </p>
        
       <div className='balance-mensual space-y-6'>
              {/* Monthly Balance Chart */}
            <h2 className='text-2xl'>BALANCE MENSUAL DEL FRACCIONAMIENTO</h2>
            <p className="text-gray-600 text-sm">
              Revise la evolución del flujo del fraccionamiento mes tras mes y planifique de manera eficaz.  
              Consulte sus presupuestos en   
              <Link href="/">
                <span className="text-green-600 underline"> Fondos y Presupuestos</span>
              </Link>.
            </p>


               {/* Date selector for monthly balances */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Desde:</label>
              <input
                type="month"
                value={startMonth}
                onChange={e => setStartMonth(e.target.value)}
                className="border rounded p-1"
              />
              <label className="text-sm text-gray-600">Hasta:</label>
              <input
                type="month"
                value={endMonth}
                onChange={e => setEndMonth(e.target.value)}
                className="border rounded p-1"
              />
            </div>
            {/* <p>
              Este reporte mensual muestra el total de ingresos, gastos y el saldo neto del fraccionamiento durante el periodo seleccionado. Gracias a esta información podrás evaluar la salud financiera, identificar tendencias de consumo y optimizar la planificación de recursos para garantizar una administración eficiente y transparente.
            </p> */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="text-sm text-gray-600 mb-2">
                Balance Mensual ({formatMonthYear(startMonth)} – {formatMonthYear(endMonth)})
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={monthlyBalances.map(({ month, year, balance }) => ({
                    month: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
                    balance
                  }))}
                >
                  <XAxis dataKey="month" stroke="#aaa" />
                  <Tooltip />
                  <Line type="monotone" dataKey="balance" stroke="#3d7953" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
      
          </div>
    </div>
  );
}
