import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnalyticsCharts } from "./Charts";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ months?: string }>;
}) {
  await requireUser();
  const params = await searchParams;

  const numMonths = params?.months ? parseInt(params.months) : 6;

  const now = new Date();

  // Get data for last N months comparison
  const lastNMonths = Array.from({length: numMonths}).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  }).reverse();

  const allMonthsData = await Promise.all(lastNMonths.map(async (m) => {
    const mStart = new Date(m.year, m.month - 1, 1);
    const mEnd = new Date(m.year, m.month, 0, 23, 59, 59);

    const txs = await prisma.transaction.findMany({
      where: { date: { gte: mStart, lte: mEnd }, type: { in: ["INCOME", "EXPENSE"] } },
      include: { category: true }
    });

    const inc = txs.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0);
    const exp = txs.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0);

    // Group expenses by category for this month
    const expensesByCatMap = new Map();
    txs.filter(t => t.type === "EXPENSE").forEach(t => {
      const name = t.category?.name || "Sin Categoría";
      const color = t.category?.color || "#94a3b8";
      const current = expensesByCatMap.get(name) || { name, value: 0, color };
      current.value += t.amount;
      expensesByCatMap.set(name, current);
    });

    const expensesByCategory = Array.from(expensesByCatMap.values()).filter(x => x.value > 0);

    return {
      name: `${m.month}/${m.year}`,
      Ingresos: inc,
      Gastos: exp,
      categories: expensesByCategory
    };
  }));

  // Create a helper function text script to pass to client
  // Since we can't pass functions from server to client easily, we pass the data dict
  const categoryDataDict = allMonthsData.reduce((acc, data) => {
    acc[data.name] = data.categories;
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Análisis Dinámico</h1>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow">
        <p className="font-medium">Período a analizar:</p>
        <div className="flex gap-2">
          {[3, 6, 12].map(n => (
            <Link
              key={n}
              href={`/analytics?months=${n}`}
              className={`px-3 py-1 rounded-md text-sm font-medium ${numMonths === n ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {n} meses
            </Link>
          ))}
        </div>
      </div>

      <AnalyticsCharts
        monthsComparison={allMonthsData.map(d => ({ name: d.name, Ingresos: d.Ingresos, Gastos: d.Gastos }))}
        categoryDataDict={categoryDataDict}
      />
    </div>
  );
}
