"use client";

import { useState } from "react";
import { processTaskInstance } from "../actions/agenda";

export function ProcessTaskModal({
  instance,
  onClose
}: {
  instance: any;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(instance.fixedTask.amount);

  const handleProcess = async (action: "PAY" | "CANCEL") => {
    setLoading(true);
    await processTaskInstance(instance.id, action, amount);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full space-y-4">
        <h3 className="text-xl font-bold">Procesar: {instance.fixedTask.name}</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">Monto Final ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-lg shadow-sm"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            onClick={() => handleProcess("PAY")}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-md font-medium disabled:opacity-50"
          >
            Confirmar y Registrar
          </button>
          <button
            onClick={() => handleProcess("CANCEL")}
            disabled={loading}
            className="flex-1 bg-red-100 text-red-600 py-2 rounded-md font-medium disabled:opacity-50"
          >
            Cancelar mes
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full text-gray-500 py-2 hover:text-gray-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
