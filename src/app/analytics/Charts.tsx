"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import { useState } from "react";

export function AnalyticsCharts({
  monthsComparison,
  categoryDataDict
}: {
  monthsComparison: any[];
  categoryDataDict: Record<string, any[]>;
}) {
  const [selectedMonth, setSelectedMonth] = useState(monthsComparison[monthsComparison.length - 1]?.name);

  const expensesByCategory = categoryDataDict[selectedMonth] || [];

  return (
    <div className="space-y-8">
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-center">
          Gastos por Categoría - {selectedMonth}
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString("es-AR")}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-center">Comparativa Ingresos vs Gastos</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthsComparison}
              margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString("es-AR")}`} />
              <Legend />
              <Bar
                dataKey="Ingresos"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                onClick={(data) => { if (data?.name) setSelectedMonth(data.name); }}
                cursor="pointer"
              />
              <Bar
                dataKey="Gastos"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                onClick={(data) => { if (data?.name) setSelectedMonth(data.name); }}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-gray-500 mt-2">Hacé clic en las barras de un mes para ver su gráfico de torta.</p>
      </div>
    </div>
  );
}
