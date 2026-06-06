"use client";

import { useState } from "react";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { deleteCategory, editCategory } from "@/app/actions/finance";

type Category = {
  id: string;
  name: string;
  type: string;
  color: string | null;
};

export default function CategoryList({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [editColor, setEditColor] = useState("");

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;

    const res = await deleteCategory(id);
    if (res?.error) {
      alert(res.error);
    } else {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  const startEditing = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditType(cat.type as "INCOME" | "EXPENSE");
    setEditColor(cat.color || "#cccccc");
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleSave = async (id: string) => {
    const res = await editCategory(id, editName, editType, editColor);
    if (res.success) {
      setCategories(categories.map(c =>
        c.id === id ? { ...c, name: editName, type: editType, color: editColor } : c
      ));
      setEditingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {categories.map((cat) => (
          <li key={cat.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 gap-4">
            {editingId === cat.id ? (
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as "INCOME" | "EXPENSE")}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="EXPENSE">Gasto</option>
                  <option value="INCOME">Ingreso</option>
                </select>
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="h-8 w-12 rounded-md border border-gray-300 p-0.5"
                />
                <div className="flex items-center gap-2">
                  <button onClick={() => handleSave(cat.id)} className="text-green-600 hover:text-green-800 p-1">
                    <Check size={18} />
                  </button>
                  <button onClick={cancelEditing} className="text-red-600 hover:text-red-800 p-1">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color || "#ccc" }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-500">
                      {cat.type === "EXPENSE" ? "Gasto" : "Ingreso"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEditing(cat)} className="text-indigo-500 hover:text-indigo-700 p-2">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {categories.length === 0 && (
          <li className="p-8 text-center text-gray-500">
            No hay categorías creadas
          </li>
        )}
      </ul>
    </div>
  );
}
