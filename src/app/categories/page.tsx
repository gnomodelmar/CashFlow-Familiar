import { requireHouse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Trash2, ArrowLeft } from "lucide-react";
import { createCategory, deleteCategory } from "../actions/finance";

export default async function CategoriesPage() {
  const session = await requireHouse();

  const categories = await prisma.category.findMany({
    where: { houseId: session.houseId! },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Categorías</h1>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Nueva Categoría</h2>
        <form
          action={async (formData) => {
            "use server";
            const name = formData.get("name") as string;
            const type = formData.get("type") as "INCOME" | "EXPENSE";
            const color = formData.get("color") as string;
            if (name && type) {
              await createCategory(name, type, color || "#cccccc");
            }
          }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            required
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            name="type"
            className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="EXPENSE">Gasto</option>
            <option value="INCOME">Ingreso</option>
          </select>
          <input
            type="color"
            name="color"
            defaultValue="#6366f1"
            className="h-10 w-14 rounded-md border border-gray-300 p-1"
          />
          <button
            type="submit"
            className="flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircle size={18} />
            Crear
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {categories.map((cat) => (
            <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: cat.color || "#ccc" }}
                />
                <div>
                  <p className="font-medium text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-500">
                    {cat.type === "EXPENSE" ? "Gasto" : "Ingreso"}
                  </p>
                </div>
              </div>
              <form action={async () => {
                "use server";
                await deleteCategory(cat.id);
              }}>
                <button type="submit" className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 size={18} />
                </button>
              </form>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="p-8 text-center text-gray-500">
              No hay categorías creadas
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
