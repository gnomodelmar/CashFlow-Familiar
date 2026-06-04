"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFixedTask } from "../../actions/agenda";

export default function NewFixedTaskForm({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const dayOfMonth = parseInt(formData.get("dayOfMonth") as string);
    const categoryId = formData.get("categoryId") as string;

    await createFixedTask({
      name,
      amount,
      type,
      dayOfMonth,
      categoryId: categoryId || undefined,
    });

    setLoading(false);
    router.push("/agenda/config");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => setType("EXPENSE")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            type === "EXPENSE" ? "bg-white text-red-600 shadow" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Gasto Fijo
        </button>
        <button
          type="button"
          onClick={() => setType("INCOME")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            type === "INCOME" ? "bg-white text-green-600 shadow" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Ingreso Fijo
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre (Ej: Alquiler, Internet)</label>
        <input
          type="text"
          name="name"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Monto Estimado ($)</label>
        <input
          type="number"
          name="amount"
          step="0.01"
          min="0.01"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-lg text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Día del mes (1 al 31)</label>
        <input
          type="number"
          name="dayOfMonth"
          min="1"
          max="31"
          required
          defaultValue="1"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Categoría</label>
        <select
          name="categoryId"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">(Opcional) Selecciona una categoría...</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar Ítem Fijo"}
      </button>
    </form>
  );
}
