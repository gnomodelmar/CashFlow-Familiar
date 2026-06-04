"use client";

import { useState } from "react";
import { saveManualSavings } from "../actions/savings";

export default function SavingsManager({
  month,
  year,
  currentSavings,
  realTotal
}: {
  month: number;
  year: number;
  currentSavings: number | null;
  realTotal: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [savingsValue, setSavingsValue] = useState(currentSavings ?? realTotal);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await saveManualSavings(month, year, savingsValue);
    setLoading(false);
    setIsEditing(false);
  };

  const handleClear = async () => {
    setLoading(true);
    await saveManualSavings(month, year, null);
    setSavingsValue(realTotal);
    setLoading(false);
    setIsEditing(false);
  };

  const hasAdjustment = currentSavings !== null && Math.abs(currentSavings - realTotal) > 0.01;
  const difference = currentSavings !== null ? currentSavings - realTotal : 0;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Ahorro del Mes</h2>
          <p className="text-sm text-gray-500">
            {currentSavings !== null ? "Valor definido manualmente" : "Calculado automáticamente"}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Editar Ahorro
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          <div className="text-4xl font-bold text-indigo-600">
            ${(currentSavings ?? realTotal).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>

          {hasAdjustment && (
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm">
              <p>El sistema generó un asiento de ajuste de <strong>${difference.toLocaleString("es-AR")}</strong> para cuadrar el balance real con tu ahorro indicado.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto Ahorrado Exacto ($)</label>
            <input
              type="number"
              value={savingsValue}
              onChange={(e) => setSavingsValue(Number(e.target.value))}
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-lg text-gray-900 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-md font-medium disabled:opacity-50"
            >
              Fijar Ahorro
            </button>
            <button
              onClick={handleClear}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md font-medium disabled:opacity-50"
            >
              Usar Calculado
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="flex-1 bg-red-50 text-red-600 py-2 rounded-md font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
