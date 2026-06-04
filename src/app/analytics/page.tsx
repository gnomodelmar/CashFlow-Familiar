import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnalyticsCharts } from "./Charts";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  await requireUser();
  const params = await searchParams;

  const now = new Date();
  const month = params?.month ? parseInt(params.month) : now.getMonth() + 1;
  const year = params?.year ? parseInt(params.year) : now.getFullYear();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Get data for expenses by category
  const expenses = await prisma.transaction.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      type: "EXPENSE"
    },
    include: { category: true }
  });

  const expensesByCatMap = new Map();
  expenses.forEach(t => {
    const name = t.category?.name || "Sin Categoría";
    const color = t.category?.color || "#94a3b8";
    const current = expensesByCatMap.get(name) || { name, value: 0, color };
    current.value += t.amount;
    expensesByCatMap.set(name, current);
  });
  const expensesByCategory = Array.from(expensesByCatMap.values()).filter(x => x.value > 0);

  // Get data for last 3 months comparison
  const last3Months = Array.from({length: 3}).map((_, i) => {
    const d = new Date(year, month - 1 - i, 1);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  }).reverse();

  const monthsComparison = await Promise.all(last3Months.map(async (m) => {
    const mStart = new Date(m.year, m.month - 1, 1);
    const mEnd = new Date(m.year, m.month, 0, 23, 59, 59);

    const txs = await prisma.transaction.findMany({
      where: { date: { gte: mStart, lte: mEnd }, type: { in: ["INCOME", "EXPENSE"] } }
    });

    const inc = txs.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0);
    const exp = txs.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0);

    return {
      name: `${m.month}/${m.year}`,
      Ingresos: inc,
      Gastos: exp
    };
  }));

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Análisis</h1>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow">
        <Link
          href={`/analytics?month=${month === 1 ? 12 : month - 1}&year=${month === 1 ? year - 1 : year}`}
          className="text-indigo-600 font-medium"
        >
          &larr; Anterior
        </Link>
        <h2 className="text-lg font-bold">
          {monthNames[month - 1]} {year}
        </h2>
        <Link
          href={`/analytics?month=${month === 12 ? 1 : month + 1}&year=${month === 12 ? year + 1 : year}`}
          className="text-indigo-600 font-medium"
        >
          Siguiente &rarr;
        </Link>
      </div>

      {expensesByCategory.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-xl shadow text-gray-500">
          No hay gastos registrados en este mes para graficar.
        </div>
      ) : (
        <AnalyticsCharts
          expensesByCategory={expensesByCategory}
          monthsComparison={monthsComparison}
        />
      )}
    </div>
  );
}
