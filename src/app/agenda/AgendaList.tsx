"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { ProcessTaskModal } from "./ProcessTaskModal";

export function AgendaList({ instances }: { instances: any[] }) {
  const [selectedInstance, setSelectedInstance] = useState<any | null>(null);

  return (
    <>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {instances.map((instance) => (
            <li key={instance.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    instance.status === "PAID" ? "bg-green-100 text-green-600" :
                    instance.status === "CANCELLED" ? "bg-red-100 text-red-600" :
                    "bg-yellow-100 text-yellow-600"
                  }`}>
                    {instance.status === "PAID" ? <CheckCircle size={20} /> :
                     instance.status === "CANCELLED" ? <XCircle size={20} /> :
                     <Clock size={20} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{instance.fixedTask.name}</p>
                    <p className="text-xs text-gray-500">
                      Día {instance.fixedTask.dayOfMonth}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <p className={`font-semibold ${instance.fixedTask.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                    ${(instance.finalAmount ?? instance.fixedTask.amount).toLocaleString("es-AR")}
                  </p>

                  {instance.status === "PENDING" && (
                    <button
                      onClick={() => setSelectedInstance(instance)}
                      className="text-xs text-indigo-600 font-medium hover:text-indigo-800 mt-1"
                    >
                      Procesar
                    </button>
                  )}
                  {instance.status === "PAID" && (
                    <span className="text-xs text-green-600 font-medium mt-1">Pagado</span>
                  )}
                  {instance.status === "CANCELLED" && (
                    <span className="text-xs text-red-600 font-medium mt-1">Cancelado</span>
                  )}
                </div>
              </div>
            </li>
          ))}
          {instances.length === 0 && (
            <li className="p-8 text-center text-gray-500">
              No hay ítems en la agenda para este mes.
            </li>
          )}
        </ul>
      </div>

      {selectedInstance && (
        <ProcessTaskModal
          instance={selectedInstance}
          onClose={() => setSelectedInstance(null)}
        />
      )}
    </>
  );
}
