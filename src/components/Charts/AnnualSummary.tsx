import { getAnnualSummary } from "@/utils/api";
import Link from "next/link";
import { useEffect, useState } from "react";

// Annual summary component
export const AnnualSummary: React.FC<{ defaultYear: number }> = ({ defaultYear }) => {
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [summary, setSummary] = useState<{ incomes: number; expenses: number } | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await getAnnualSummary(selectedYear);
      setSummary(res);
    };
    fetch();
  }, [selectedYear]);

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-2">Balance Anual</h2>
      <p className="mb-4 text-gray-600">
        Analiza el rendimiento anual de egresos e ingresos y compáralo con tu conciliación bancaria en{' '}
        <Link href="/">
          <span className="text-green-600 underline">Banca y Facturación</span>
        </Link>
        .
      </p>
      <div className="flex items-center space-x-4 mb-4">
        <label className="text-sm text-gray-600">Año:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border rounded p-1"
        >
          {[...Array(5)].map((_, i) => {
            const year = defaultYear - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl text-center shadow">
            <h3 className="text-gray-500 text-sm">Ingresos</h3>
            <p className="text-green-700 font-bold text-lg">
              ${summary.incomes?summary.incomes.toFixed(2) : 'Sin registro'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl text-center shadow">
            <h3 className="text-gray-500 text-sm">Egresos</h3>
            <p className="text-red-700 font-bold text-lg">
              ${summary.expenses? summary.expenses.toFixed(2) : 'Sin registro'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl text-center shadow">
            <h3 className="text-gray-500 text-sm">Balance Neto</h3>
            <p className="text-gray-700 font-bold text-lg">
              ${summary.incomes && summary.expenses
                ? (summary.incomes - summary.expenses).toFixed(2)
                : 'Sin registro'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};