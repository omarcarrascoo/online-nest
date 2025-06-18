import { getMonthlyBalance } from "@/utils/api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

// Monthly balance line chart component
export const MonthlyBalanceChart: React.FC<{ defaultStart: string; defaultEnd: string }> = ({ defaultStart, defaultEnd }) => {
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [data, setData] = useState<Array<{ month: string; balance: number }>>([]);

  const formatMonthYear = (ym: string) => {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  const fetchData = useCallback(async () => {
    const [sy, sm] = start.split('-').map(Number);
    const [ey, em] = end.split('-').map(Number);
    const months: { year: number; month: number }[] = [];
    let y = sy,
      mth = sm;
    while (y < ey || (y === ey && mth <= em)) {
      months.push({ year: y, month: mth });
      mth++;
      if (mth > 12) {
        mth = 1;
        y++;
      }
    }
    const results = await Promise.all(
      months.map(async ({ year, month }) => {
        const res = await getMonthlyBalance(month, year);
        return { month: new Date(year, month - 1).toLocaleString('default', { month: 'short' }), balance: res.balance };
      })
    );
    setData(results);
  }, [start, end]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-2">Balance Mensual del Fraccionamiento</h2>
      <p className="text-gray-600 mb-4">
        Revise la evolución mes a mes y planifique eficazmente. Consulte sus presupuestos en{' '}
        <Link href="/">
          <span className="text-green-600 underline">Fondos y Presupuestos</span>
        </Link>
        .
      </p>
      <div className="flex items-center space-x-2 mb-4">
        <label className="text-sm text-gray-600">Desde:</label>
        <input type="month" value={start} onChange={(e) => setStart(e.target.value)} className="border rounded p-1" />
        <label className="text-sm text-gray-600">Hasta:</label>
        <input type="month" value={end} onChange={(e) => setEnd(e.target.value)} className="border rounded p-1" />
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-sm text-gray-600 mb-2">
          ({formatMonthYear(start)} – {formatMonthYear(end)})
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="month" stroke="#aaa" />
            <Tooltip />
            <Line type="monotone" dataKey="balance" stroke="#3d7953" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};