"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { editTransaction } from "../../../actions/finance";

type Category = {
  id: string;
  name: string;
  type: string;
};

export default function EditTransactionForm({
  transaction,
  categories
}: {
  transaction: any;
  categories: Category[];
}) {
  const router = useRouter();
  const [type, setType] = useState<"EXPENSE" | "INCOME" | "CC_PAYMENT">(transaction.type);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CREDIT">(transaction.paymentMethod);
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get("amount") as string);
    const date = new Date(formData.get("date") as string);
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;

    await editTransaction(transaction.id, {
      amount,
      date,
      description,
      type,
      categoryId: categoryId || undefined,
      paymentMethod,
    });

    setLoading(false);
    router.push("/transactions");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
      {type !== "CC_PAYMENT" && (
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setType("EXPENSE")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              type === "EXPENSE" ? "bg-white text-red-600 shadow" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => setType("INCOME")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              type === "INCOME" ? "bg-white text-green-600 shadow" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Ingreso
          </button>
        </div>
      )}

      {type === "EXPENSE" && (
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setPaymentMethod("CASH")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              paymentMethod === "CASH" ? "bg-white text-indigo-600 shadow" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Efectivo / Débito
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("CREDIT")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              paymentMethod === "CREDIT" ? "bg-white text-orange-600 shadow" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Tarjeta de Crédito
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Monto ($)</label>
        <input
          type="number"
          name="amount"
          step="0.01"
          min="0.01"
          required
          defaultValue={transaction.amount}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-lg text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha</label>
        <input
          type="date"
          name="date"
          required
          defaultValue={new Date(transaction.date).toISOString().split("T")[0]}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {type !== "CC_PAYMENT" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            name="categoryId"
            required
            defaultValue={transaction.categoryId || ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Selecciona una categoría...</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
        <input
          type="text"
          name="description"
          defaultValue={transaction.description || ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Actualizar Registro"}
      </button>
    </form>
  );
}
