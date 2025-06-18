"use client";
import React, { useState, useEffect } from "react";
import { getDelinquency } from "../../utils/api";
import Link from "next/link";

interface Resident {
  id: string;
  name: string;
  unitNumber: string;
  email: string;
}

interface FineItem {
  id: string;
  resident: Resident;
  description: string;
  amount: number;
}

interface DelinquencyResponse {
  fines: FineItem[];
}

interface DelinquencyProps {
  data?: FineItem[];
  autoFetch?: boolean;
}

export default function Delinquency({
  data: propData = [],
  autoFetch = false,
}: DelinquencyProps) {
  const [data, setData] = useState<FineItem[]>(propData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autoFetch) {
      setLoading(true);
      getDelinquency()
        .then((res: DelinquencyResponse) => setData(res.fines))
        .catch((err) => console.error("Error fetching morosidad:", err))
        .finally(() => setLoading(false));
    }
  }, [autoFetch]);

  const grouped = data.reduce<Record<string, { resident: Resident; fines: FineItem[] }>>(
    (acc, item) => {
      const key = item.resident.id;
      if (!acc[key]) acc[key] = { resident: item.resident, fines: [] };
      acc[key].fines.push(item);
      return acc;
    },
    {}
  );

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <p className="text-sm text-gray-500">Cargando morosidad...</p>
      </div>
    );
  }

  return (
   <>
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Morosidad por Residente</h2>
      {/* Scrollable container */}
      <div className="max-h-[500px] overflow-y-auto space-y-6">
        {Object.values(grouped).map(({ resident, fines }) => {
          const subtotal = fines.reduce((sum, f) => sum + f.amount, 0);
          return (
            <div key={resident.id} className="space-y-2 border-b-1 p-3 border-b-gray-300">
              <div className="flex items-center justify-between  pb-1">
                <div>
                  <p className="font-medium">
                    {resident.name}{' '}
                    <span className="text-gray-500">({resident.unitNumber})</span>
                  </p>
                  <p className="text-sm text-gray-400">{resident.email}</p>
                </div>
                <p className="font-semibold text-red-600">
                  Total: ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-1">Descripción</th>
                    <th className="py-1 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {fines.map(({ id, description, amount }) => (
                    <tr key={id} className="border-b border-amber-50 last:border-0">
                      <td className="py-1">{description}</td>
                      <td className="py-1 text-right">
                        ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

                
            </div>
          );
        })}
       
        {data.length === 0 && (
          <p className="text-center text-gray-500">No hay morosidad registrada.</p>
        )}
      </div>
    </div>
     <p className="text-gray-600">
             Mas informacion sobre el reporte en la seccion de 
            <Link href="/">
                <span className="text-green-600 underline">Morosidad y Multas</span>
            </Link>
        </p>
    </>
  );
}
