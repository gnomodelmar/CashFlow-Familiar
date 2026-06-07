"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { createPlannedEvent, deletePlannedEvent } from "../actions/plannedEvents";
import { Trash2 } from "lucide-react";

export function ProjectionsCalculator({
  baseIncome,
  baseExpense,
  fixedTasks,
  plannedEvents
}: {
  baseIncome: number;
  baseExpense: number;
  fixedTasks: any[];
  plannedEvents: any[];
}) {
  const [monthsToProject, setMonthsToProject] = useState(6);
  const [inflationRate, setInflationRate] = useState(5); // Monthly inflation %
  const [incomeGrowthRate, setIncomeGrowthRate] = useState(3); // Monthly income growth %

  const [currentMonthIncome, setCurrentMonthIncome] = useState(baseIncome);
  const [currentMonthExpense, setCurrentMonthExpense] = useState(baseExpense);
  const [futureBaseIncome, setFutureBaseIncome] = useState(baseIncome);
  const [futureBaseExpense, setFutureBaseExpense] = useState(baseExpense);

  const currentDate = new Date();

  const getMonthName = (monthIndex: number, year: number) => {
    const date = new Date(year, monthIndex, 1);
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  };

  const generateProjections = () => {
    const data = [];
    let cumulativeSavings = 0;

    // Use current month settings for the first month, and future base for the rest
    let currentIncome = futureBaseIncome;
    let currentBaseExpense = futureBaseExpense;

    for (let i = 0; i < monthsToProject; i++) {
      const projectionDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const projMonth = projectionDate.getMonth();
      const projYear = projectionDate.getFullYear();
      // Calculate this month's fixed tasks (applying inflation based on month index i)
      const monthFixedIncome = fixedTasks
        .filter(t => t.type === "INCOME")
        .reduce((acc, t) => acc + (t.amount * Math.pow(1 + (inflationRate/100), i)), 0);

      const monthFixedExpense = fixedTasks
        .filter(t => t.type === "EXPENSE")
        .reduce((acc, t) => acc + (t.amount * Math.pow(1 + (inflationRate/100), i)), 0);

      // Get planned events for this specific month
      const monthPlannedEvents = plannedEvents.filter(e => e.month === projMonth + 1 && e.year === projYear);
      const plannedIncome = monthPlannedEvents.filter(e => e.type === "INCOME").reduce((acc, e) => acc + e.amount, 0);
      const plannedExpense = monthPlannedEvents.filter(e => e.type === "EXPENSE").reduce((acc, e) => acc + e.amount, 0);

      const baseInc = i === 0 ? currentMonthIncome : currentIncome;
      const baseExp = i === 0 ? currentMonthExpense : currentBaseExpense;

      const totalIncome = baseInc + monthFixedIncome + plannedIncome;
      const totalExpense = baseExp + monthFixedExpense + plannedExpense;
      const monthSaving = totalIncome - totalExpense;

      cumulativeSavings += monthSaving;

      data.push({
        mes: getMonthName(projMonth, projYear),
        Ingresos: Math.round(totalIncome),
        Gastos: Math.round(totalExpense),
        Eventuales: Math.round(plannedIncome - plannedExpense),
        Ahorro: Math.round(monthSaving),
        Acumulado: Math.round(cumulativeSavings)
      });

      // Apply growth/inflation for next month (only if we are beyond month 0)
      if (i === 0) {
        // Base is already set to futureBase for month 1, we just need to apply inflation to it once
        currentIncome = currentIncome * (1 + (incomeGrowthRate / 100));
        currentBaseExpense = currentBaseExpense * (1 + (inflationRate / 100));
      } else {
        currentIncome = currentIncome * (1 + (incomeGrowthRate / 100));
        currentBaseExpense = currentBaseExpense * (1 + (inflationRate / 100));
      }
    }
    return data;
  };

  const projectionsData = generateProjections();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="font-bold text-gray-900 border-b pb-2">Variables del Escenario</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Meses</label>
            <input
              type="number"
              value={monthsToProject}
              onChange={(e) => setMonthsToProject(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm"
              min="1" max="24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Inflación (%)</label>
            <input
              type="number"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Crec. Ingreso (%)</label>
            <input
              type="number"
              value={incomeGrowthRate}
              onChange={(e) => setIncomeGrowthRate(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ingreso Base (Mes Actual)</label>
            <input
              type="number"
              value={currentMonthIncome}
              onChange={(e) => setCurrentMonthIncome(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gasto Base (Mes Actual)</label>
            <input
              type="number"
              value={currentMonthExpense}
              onChange={(e) => setCurrentMonthExpense(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ingreso Base (Futuro)</label>
            <input
              type="number"
              value={futureBaseIncome}
              onChange={(e) => setFutureBaseIncome(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gasto Base (Futuro)</label>
            <input
              type="number"
              value={futureBaseExpense}
              onChange={(e) => setFutureBaseExpense(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Planned Events Section */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="font-bold text-gray-900 border-b pb-2">Eventos Eventuales (Ingresos / Gastos Extraordinarios)</h3>

        <form action={createPlannedEvent} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <input type="text" name="title" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Ej: Arreglo del auto" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto</label>
            <input type="number" name="amount" required step="0.01" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select name="type" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="EXPENSE">Gasto</option>
              <option value="INCOME">Ingreso</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mes</label>
            <input type="number" name="month" required min="1" max="12" defaultValue={currentDate.getMonth() + 1} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 w-20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Año</label>
            <input type="number" name="year" required min={currentDate.getFullYear()} defaultValue={currentDate.getFullYear()} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 w-24" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
            Agregar
          </button>
        </form>

        {plannedEvents.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Eventos Planeados</h4>
            <ul className="space-y-2">
              {plannedEvents.map(event => (
                <li key={event.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                  <div className="flex gap-4 items-center">
                    <span className={`font-medium ${event.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {event.type === 'INCOME' ? '+' : '-'}${event.amount.toLocaleString("es-AR")}
                    </span>
                    <span>{event.title}</span>
                    <span className="text-sm text-gray-500">({event.month}/{event.year})</span>
                  </div>
                  <form action={deletePlannedEvent.bind(null, event.id)}>
                    <button type="submit" className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}
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
              <Area type="monotone" dataKey="Ingresos" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
              <Area type="monotone" dataKey="Gastos" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
              <Area type="monotone" dataKey="Ahorro" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
              <Area type="monotone" dataKey="Acumulado" stroke="#ca8a04" fill="#ca8a04" fillOpacity={0.1} />
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
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Eventuales (Neto)</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ahorro Mensual</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ahorro Acumulado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projectionsData.map((d, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{d.mes}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">${d.Ingresos.toLocaleString("es-AR")}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">${d.Gastos.toLocaleString("es-AR")}</td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${d.Eventuales >= 0 ? 'text-green-600' : 'text-red-600'}`}>${d.Eventuales.toLocaleString("es-AR")}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-indigo-600">${d.Ahorro.toLocaleString("es-AR")}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-yellow-600">${d.Acumulado.toLocaleString("es-AR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
