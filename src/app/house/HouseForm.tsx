"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createHouse, joinHouse } from "../actions/house";

export default function HouseForm({ action }: { action: "CREATE" | "JOIN" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name || !password) {
      setError("Por favor completa todos los campos");
      setLoading(false);
      return;
    }

    const serverAction = action === "CREATE" ? createHouse : joinHouse;
    const result = await serverAction(name, password);

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "Ocurrió un error");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre de la Casa
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Ej: Familia Perez"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Ej: 1234"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
      >
        {loading ? "Procesando..." : (action === "CREATE" ? "Crear Casa" : "Unirse a Casa")}
      </button>
    </form>
  );
}
