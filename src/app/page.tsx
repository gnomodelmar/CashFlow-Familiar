import { requireUser, logout } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, List, PieChart, CalendarDays, Wallet, LogOut, Settings } from "lucide-react";

export default async function Dashboard() {
  const session = await requireUser();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get current month's transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  const totalIncomes = transactions
    .filter(t => t.type === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalAdjustments = transactions
    .filter(t => t.type === "ADJUSTMENT")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncomes - totalExpenses + totalAdjustments;

  // Calculate Global Balances
  const allTransactions = await prisma.transaction.findMany({});

  const totalLifetimeIncomes = allTransactions
    .filter(t => t.type === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalLifetimeCashExpenses = allTransactions
    .filter(t => t.type === "EXPENSE" && t.paymentMethod === "CASH")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalLifetimeCreditExpenses = allTransactions
    .filter(t => t.type === "EXPENSE" && t.paymentMethod === "CREDIT")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalLifetimeAdjustments = allTransactions
    .filter(t => t.type === "ADJUSTMENT")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalCreditPayments = allTransactions
    .filter(t => t.type === "CC_PAYMENT")
    .reduce((acc, t) => acc + t.amount, 0);

  // Bank balance: Incomes - Cash Expenses - Credit Card Payments + Adjustments
  const bankBalance = totalLifetimeIncomes - totalLifetimeCashExpenses - totalCreditPayments + totalLifetimeAdjustments;

  // Credit Card Debt: Credit Expenses - Credit Card Payments
  const creditDebt = totalLifetimeCreditExpenses - totalCreditPayments;

  const netBalance = bankBalance - creditDebt;

  // Get active budgets
  const activeBudgets = await prisma.budget.findMany({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: { category: true },
  });

  const budgetsProgress = activeBudgets.map(b => {
    const spent = transactions
      .filter(t => t.categoryId === b.categoryId && t.type === "EXPENSE")
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      ...b,
      spent,
      remaining: b.amount - spent,
      percentage: Math.min(100, (spent / b.amount) * 100)
    };
  });

  // Get Agenda Items (Pending from past 30 days and upcoming next 14 days)
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const in14Days = new Date(now);
  in14Days.setDate(in14Days.getDate() + 14);

  // We need to fetch instances and filter them in memory because our DB schema
  // stores month/year instead of full dates for instances.
  const recentInstances = await prisma.taskInstance.findMany({
    where: {
      year: {
        in: [thirtyDaysAgo.getFullYear(), in14Days.getFullYear()]
      }
    },
    include: { fixedTask: true }
  });

  const dashboardAgenda = recentInstances.map(inst => {
    const dueDate = new Date(inst.year, inst.month - 1, inst.fixedTask.dayOfMonth);
    const isPast = dueDate < now;
    return { ...inst, dueDate, isPast };
  }).filter(inst => {
    // Only show pending items that are past, OR upcoming items in the next 14 days
    if (inst.status === "PENDING" && inst.dueDate >= thirtyDaysAgo && inst.dueDate <= in14Days) return true;
    return false;
  }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hola, {session.name}</h1>
          <p className="text-gray-500">Resumen de {now.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}</p>
        </div>
        <form action={logout}>
          <button type="submit" className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition">
            <LogOut size={24} />
          </button>
        </form>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500">Saldo Banco / Efectivo</p>
          <p className="text-2xl font-bold text-green-600 mt-2">${bankBalance.toLocaleString("es-AR")}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500">Deuda Tarjeta de Crédito</p>
          <p className="text-2xl font-bold text-orange-500 mt-2">${creditDebt.toLocaleString("es-AR")}</p>
        </div>
        <div className="bg-indigo-600 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-indigo-100">Saldo Real (Neto)</p>
            <p className="text-3xl font-bold mt-2">${netBalance.toLocaleString("es-AR")}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
        <Link href="/transactions/new" className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition text-center">
          <PlusCircle size={24} className="text-indigo-600 mb-1 md:mb-2" />
          <span className="text-xs md:text-sm font-medium text-gray-700">Movimiento</span>
        </Link>
        <Link href="/transactions/cc-payment" className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition text-center">
          <Wallet size={24} className="text-indigo-600 mb-1 md:mb-2" />
          <span className="text-xs md:text-sm font-medium text-gray-700">Pagar Tarjeta</span>
        </Link>
        <Link href="/agenda" className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition text-center">
          <CalendarDays size={24} className="text-indigo-600 mb-1 md:mb-2" />
          <span className="text-xs md:text-sm font-medium text-gray-700">Agenda Fija</span>
        </Link>
        <Link href="/categories" className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition text-center">
          <Settings size={24} className="text-indigo-600 mb-1 md:mb-2" />
          <span className="text-xs md:text-sm font-medium text-gray-700">Categorías</span>
        </Link>
        <Link href="/transactions" className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition text-center">
          <List size={24} className="text-indigo-600 mb-1 md:mb-2" />
          <span className="text-xs md:text-sm font-medium text-gray-700">Historial</span>
        </Link>
        <Link href="/analytics" className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition text-center">
          <PieChart size={24} className="text-indigo-600 mb-1 md:mb-2" />
          <span className="text-xs md:text-sm font-medium text-gray-700">Análisis</span>
        </Link>
        <Link href="/projections" className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition text-center">
          <PieChart size={24} className="text-indigo-600 mb-1 md:mb-2" />
          <span className="text-xs md:text-sm font-medium text-gray-700">Proyección</span>
        </Link>
        <a href="/api/export" className="col-span-3 md:col-span-7 flex items-center justify-center gap-2 p-3 bg-gray-800 text-white rounded-xl shadow-sm hover:bg-gray-700 transition">
          <span className="text-sm font-medium">Exportar a CSV / Excel</span>
        </a>
      </div>

      {/* Mini Agenda */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays size={20} className="text-indigo-600" />
            Agenda Próxima & Pendiente
          </h2>
          <Link href="/agenda" className="text-sm text-indigo-600 font-medium hover:underline">
            Ir a Agenda
          </Link>
        </div>

        <div className="space-y-4">
          {dashboardAgenda.map(item => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-medium text-gray-900">{item.fixedTask.name}</p>
                <p className={`text-xs ${item.isPast ? "text-red-500 font-bold" : "text-gray-500"}`}>
                  {item.isPast ? "Vencido: " : "Vence: "}
                  {item.dueDate.toLocaleDateString("es-AR")}
                </p>
              </div>
              <p className={`font-semibold ${item.fixedTask.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                ${item.fixedTask.amount.toLocaleString("es-AR")}
              </p>
            </div>
          ))}
          {dashboardAgenda.length === 0 && (
            <p className="text-center text-gray-500 py-4">No hay vencimientos cercanos ni pendientes.</p>
          )}
        </div>
      </div>

      {/* Budgets Progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Wallet size={20} className="text-indigo-600" />
            Estado de Presupuestos
          </h2>
          <Link href="/budgets" className="text-sm text-indigo-600 font-medium hover:underline">
            Gestionar
          </Link>
        </div>

        <div className="space-y-6">
          {budgetsProgress.map(b => (
            <div key={b.id}>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="font-medium text-gray-900">{b.category.name}</p>
                  <p className="text-xs text-gray-500">Quedan ${b.remaining.toLocaleString("es-AR")} de ${b.amount.toLocaleString("es-AR")}</p>
                </div>
                <p className={`font-semibold ${b.percentage > 90 ? "text-red-600" : b.percentage > 75 ? "text-yellow-600" : "text-green-600"}`}>
                  {b.percentage.toFixed(0)}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${b.percentage > 90 ? "bg-red-600" : b.percentage > 75 ? "bg-yellow-400" : "bg-green-500"}`}
                  style={{ width: `${b.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
          {budgetsProgress.length === 0 && (
            <p className="text-center text-gray-500 py-4">No hay presupuestos activos en este momento.</p>
          )}
        </div>
      </div>
    </div>
  );
}
