"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { MonthlyBalanceChart } from '@/components/Charts/MonthlyBalanceChart';
import { IncomeExpensePieChart } from '@/components/Charts/IncomeExpensePieChart';
import { AnnualSummary } from '@/components/Charts/AnnualSummary';
import ReserveFund from '@/components/Charts/ReserveFoundChart';
import Delinquency from '@/components/Charts/DeliquencyReport';
import ProviderExpenses from '@/components/Charts/ProvidersExpenses';
import ExtraExpenses from '@/components/Charts/ExtraExpenses';

// Main dashboard page
export default function Dashboard() {
  const today = new Date();
  const defaultEndMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const defaultStartMonth = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Panel de Administración Principal</h1>
      <ReserveFund autoFetch/>
      <p className="text-gray-600">
        Este panel agrupa los reportes clave para una administración eficiente y transparente. 
      </p>
      {/* <p className='text-gray-600'>Este reporte mensual muestra el total de ingresos, gastos y el saldo neto del fraccionamiento durante el periodo seleccionado. Gracias a esta información podrás evaluar la salud financiera, identificar tendencias de consumo y optimizar la planificación de recursos para garantizar una administración eficiente y transparente.</p> */}
      <hr />
      
      <AnnualSummary defaultYear={today.getFullYear()} />
      <IncomeExpensePieChart defaultStart={defaultEndMonth} defaultEnd={defaultEndMonth} />
      <MonthlyBalanceChart defaultStart={defaultStartMonth} defaultEnd={defaultEndMonth} />
      <hr />
      <h2 className="text-2xl font-semibold">CUENTAS POR COBRAR, MOROSIDAD Y MULTAS</h2>
      <p className="text-gray-600">
        Analiza la gestión financiera de tu fraccionamiento y revisa los pagos pendientes en esta sección del dashboard. Aquí podrás consultar las multas, las cuentas por cobrar y los pagos recientes a proveedores.
      </p>
      <ProviderExpenses autoFetch/>
      <ExtraExpenses autoFetch/>
      <Delinquency autoFetch/>
    </div>
  );
}
