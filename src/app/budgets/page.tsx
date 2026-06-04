import { requireHouse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, ArrowLeft, Trash2 } from "lucide-react";
import { deleteBudget } from "../actions/budget";
import { format } from "date-fns";

export default async function BudgetsPage() {
  const session = await requireHouse();

  const budgets = await prisma.budget.findMany({
    where: { houseId: session.houseId! },
    orderBy: { endDate: "desc" },
    include: { category: true },
  });

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold">Presupuestos</h1>
        </div>
        <Link
          href="/budgets/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <PlusCircle size={18} />
          <span className="hidden sm:inline">Nuevo Presupuesto</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {budgets.map((b) => (
            <li key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: b.category.color || "#ccc" }}
                  />
                  <p className="font-medium text-gray-900">{b.category.name}</p>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Vigencia: {format(new Date(b.startDate), "dd/MM/yyyy")} - {format(new Date(b.endDate), "dd/MM/yyyy")}
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <p className="font-semibold text-gray-900">
                  ${b.amount.toLocaleString("es-AR")}
                </p>
                <form action={async () => {
                  "use server";
                  await deleteBudget(b.id);
                }}>
                  <button type="submit" className="text-gray-400 hover:text-red-500 p-2">
                    <Trash2 size={18} />
                  </button>
                </form>
              </div>
            </li>
          ))}
          {budgets.length === 0 && (
            <li className="p-8 text-center text-gray-500">
              No hay presupuestos asignados.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
