"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ProjectionsCalculator({
  baseIncome,
  baseExpense,
  fixedTasks
}: {
  baseIncome: number;
  baseExpense: number;
  fixedTasks: any[];
}) {
  const [monthsToProject, setMonthsToProject] = useState(6);
  const [inflationRate, setInflationRate] = useState(5); // Monthly inflation %
  const [incomeGrowthRate, setIncomeGrowthRate] = useState(3); // Monthly income growth %

  const generateProjections = () => {
    const data = [];
    let currentIncome = baseIncome;
    let currentBaseExpense = baseExpense;

    for (let i = 1; i <= monthsToProject; i++) {
      // Calculate this month's fixed tasks
      const monthFixedIncome = fixedTasks
        .filter(t => t.type === "INCOME")
        .reduce((acc, t) => acc + (t.amount * Math.pow(1 + (inflationRate/100), i-1)), 0);

      const monthFixedExpense = fixedTasks
        .filter(t => t.type === "EXPENSE")
        .reduce((acc, t) => acc + (t.amount * Math.pow(1 + (inflationRate/100), i-1)), 0);

      const totalIncome = currentIncome + monthFixedIncome;
      const totalExpense = currentBaseExpense + monthFixedExpense;

      data.push({
        mes: `Mes ${i}`,
        Ingresos: Math.round(totalIncome),
        Gastos: Math.round(totalExpense),
        Ahorro: Math.round(totalIncome - totalExpense)
      });

      // Apply growth/inflation for next month
      currentIncome = currentIncome * (1 + (incomeGrowthRate / 100));
      currentBaseExpense = currentBaseExpense * (1 + (inflationRate / 100));
    }
    return data;
  };

  const projectionsData = generateProjections();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="font-bold text-gray-900 border-b pb-2">Variables del Escenario</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Meses a proyectar</label>
            <input
              type="number"
              value={monthsToProject}
              onChange={(e) => setMonthsToProject(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              min="1" max="24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Inflación Mensual (%)</label>
            <input
              type="number"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Aumento Ingresos Mensual (%)</label>
            <input
              type="number"
              value={incomeGrowthRate}
              onChange={(e) => setIncomeGrowthRate(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              step="0.1"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4 text-center">Proyección de Ahorros y Flujo</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={projectionsData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString("es-AR")}`} />
              <Area type="monotone" dataKey="Ingresos" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
              <Area type="monotone" dataKey="Gastos" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
              <Area type="monotone" dataKey="Ahorro" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gastos</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ahorro Resultante</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projectionsData.map((d, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{d.mes}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">${d.Ingresos.toLocaleString("es-AR")}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">${d.Gastos.toLocaleString("es-AR")}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-indigo-600">${d.Ahorro.toLocaleString("es-AR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
