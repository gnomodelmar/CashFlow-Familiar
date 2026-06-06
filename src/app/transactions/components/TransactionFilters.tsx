"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";

type Category = {
  id: string;
  name: string;
};

export default function TransactionFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");

  const updateFilters = useCallback((updates: { search?: string; categoryId?: string; dateFrom?: string; dateTo?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.search !== undefined) {
      if (updates.search) params.set("search", updates.search);
      else params.delete("search");
    }

    if (updates.categoryId !== undefined) {
      if (updates.categoryId) params.set("categoryId", updates.categoryId);
      else params.delete("categoryId");
    }

    if (updates.dateFrom !== undefined) {
      if (updates.dateFrom) params.set("dateFrom", updates.dateFrom);
      else params.delete("dateFrom");
    }

    if (updates.dateTo !== undefined) {
      if (updates.dateTo) params.set("dateTo", updates.dateTo);
      else params.delete("dateTo");
    }

    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search, categoryId, dateFrom, dateTo });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, categoryId, dateFrom, dateTo, updateFilters]);

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">Buscar</label>
        <input
          type="text"
          placeholder="Monto, descripción o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="w-full sm:w-48">
        <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            updateFilters({ ...{ search, categoryId, dateFrom, dateTo }, categoryId: e.target.value });
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Todas</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-40">
        <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            updateFilters({ ...{ search, categoryId, dateFrom, dateTo }, dateFrom: e.target.value });
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="w-full sm:w-40">
        <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            updateFilters({ ...{ search, categoryId, dateFrom, dateTo }, dateTo: e.target.value });
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}