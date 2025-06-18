import { getExtraExpenses, getIncomeExpense, getProviderExpenses } from "@/utils/api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, } from "recharts";
// Custom label for the pie chart
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


// Pie chart component
export const IncomeExpensePieChart: React.FC<{ defaultStart: string; defaultEnd: string }> = ({ defaultStart, defaultEnd }) => {
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [values, setValues] = useState<{ ingresos: number; egresos: number }>({ ingresos: 0, egresos: 0 });

  const COLORS = ['#417e69', '#714141'];

  const fetchData = useCallback(async () => {
    const [sy, sm] = start.split('-').map(Number);
    const [ey, em] = end.split('-').map(Number);
    const startDate = `${sy}-${String(sm).padStart(2, '0')}-01`;
    const lastDay = new Date(ey, em, 0).getDate();
    const endDate = `${ey}-${String(em).padStart(2, '0')}-${lastDay}`;

    const ie = await getIncomeExpense(startDate, endDate);
    const ingresos = (ie.payments || []).reduce((sum: number, p: any) => sum + p.amount, 0);
    const pe = await getProviderExpenses(startDate, endDate);
    const ee = await getExtraExpenses(startDate, endDate);
    const egresos =
      (pe || []).reduce((sum: number, p: any) => sum + p.totalAmount, 0) +
      (ee || []).reduce((sum: number, e: any) => sum + e.amount, 0);

    setValues({ ingresos, egresos });
  }, [start, end]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <section className="mb-10 bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-2">Distribución: Ingresos vs Egresos</h2>
      <div className="flex items-center space-x-2 mb-4">
        <label className="text-sm text-gray-600">Desde:</label>
        <input type="month" value={start} onChange={(e) => setStart(e.target.value)} className="border rounded p-1" />
        <label className="text-sm text-gray-600">Hasta:</label>
        <input type="month" value={end} onChange={(e) => setEnd(e.target.value)} className="border rounded p-1" />
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={[{ name: 'Ingresos', value: values.ingresos }, { name: 'Egresos', value: values.egresos }]}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {COLORS.map((fill, idx) => (
              <Cell key={idx} fill={fill} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(val: number) => val.toFixed(2)} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
      <p className="mt-2 text-sm text-gray-600">
        Este gráfico muestra en qué proporción fueron los ingresos frente a los egresos durante el periodo seleccionado.
      </p>
      <p className="mt-4 text-sm text-gray-600">
        Detalles completos en{' '}
        <Link href="/">
          <span className="text-green-600 underline">Ingresos y Egresos</span>
        </Link>
        .
      </p>
    </section>
  );
};