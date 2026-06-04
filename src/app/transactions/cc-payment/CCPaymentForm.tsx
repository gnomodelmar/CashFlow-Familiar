"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTransaction } from "../../actions/finance";

export default function CCPaymentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get("amount") as string);
    const date = new Date(formData.get("date") as string);

    await createTransaction({
      amount,
      date,
      description: "Pago de Tarjeta de Crédito",
      type: "CC_PAYMENT",
      paymentMethod: "CASH", // CC payment uses CASH to reduce the debt
    });

    setLoading(false);
    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Monto del Pago ($)</label>
        <input
          type="number"
          name="amount"
          step="0.01"
          min="0.01"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-lg text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha de Pago</label>
        <input
          type="date"
          name="date"
          required
          defaultValue={new Date().toISOString().split("T")[0]}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Registrar Pago de Tarjeta"}
      </button>
    </form>
  );
}
