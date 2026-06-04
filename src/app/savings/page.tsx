import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SavingsManager from "./SavingsManager";

export default async function SavingsPage({
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

  // Get real transactions (excluding adjustments)
  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      type: { in: ["INCOME", "EXPENSE"] },
    },
  });

  const incomes = transactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0);
  const realTotal = incomes - expenses;

  // Get saved summary
  const summary = await prisma.monthlySummary.findUnique({
    where: { month_year: { month, year } }
  });

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
        <h1 className="text-2xl font-bold">Gestión de Ahorros</h1>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow">
        <Link
          href={`/savings?month=${month === 1 ? 12 : month - 1}&year=${month === 1 ? year - 1 : year}`}
          className="text-indigo-600 font-medium"
        >
          &larr; Anterior
        </Link>
        <h2 className="text-lg font-bold">
          {monthNames[month - 1]} {year}
        </h2>
        <Link
          href={`/savings?month=${month === 12 ? 1 : month + 1}&year=${month === 12 ? year + 1 : year}`}
          className="text-indigo-600 font-medium"
        >
          Siguiente &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Ingresos Reales</p>
          <p className="text-xl font-bold text-green-600">${incomes.toLocaleString("es-AR")}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Gastos Reales</p>
          <p className="text-xl font-bold text-red-600">${expenses.toLocaleString("es-AR")}</p>
        </div>
      </div>

      <SavingsManager
        month={month}
        year={year}
        currentSavings={summary?.manualSavings ?? null}
        realTotal={realTotal}
      />

    </div>
  );
}
