import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, ArrowLeft, Trash2 } from "lucide-react";
import { deleteFixedTask } from "../../actions/agenda";

export default async function AgendaConfigPage() {
  await requireUser();

  const fixedTasks = await prisma.fixedTask.findMany({
    orderBy: { dayOfMonth: "asc" },
    include: { category: true },
  });

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/agenda" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold">Configuración de Agenda</h1>
        </div>
        <Link
          href="/agenda/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <PlusCircle size={18} />
          <span className="hidden sm:inline">Nuevo Ítem Fijo</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {fixedTasks.map((task) => (
            <li key={task.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 gap-4">
              <div>
                <p className="font-medium text-gray-900">{task.name}</p>
                <div className="text-sm text-gray-500 flex gap-2">
                  <span>Día {task.dayOfMonth} de cada mes</span>
                  {task.category && (
                    <>
                      <span>•</span>
                      <span>{task.category.name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <p className={`font-semibold ${task.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                  {task.type === "INCOME" ? "+" : "-"}${task.amount.toLocaleString("es-AR")}
                </p>
                <form action={async () => {
                  "use server";
                  await deleteFixedTask(task.id);
                }}>
                  <button type="submit" className="text-gray-400 hover:text-red-500 p-2">
                    <Trash2 size={18} />
                  </button>
                </form>
              </div>
            </li>
          ))}
          {fixedTasks.length === 0 && (
            <li className="p-8 text-center text-gray-500">
              No hay ítems fijos configurados.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
