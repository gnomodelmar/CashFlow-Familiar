import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { Home, PlusCircle, LogIn } from "lucide-react";

export default async function HouseSelectionPage() {
  const session = await requireUser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 space-y-6">
        <div className="text-center">
          <Home className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">¡Hola, {session.name}!</h1>
          <p className="text-gray-500 mt-2">
            Para continuar, necesitas crear una nueva &quot;Casa&quot; (tu grupo familiar) o unirte a una ya existente.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Link
            href="/house/create"
            className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition"
          >
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <PlusCircle size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900">Crear Nueva Casa</h3>
              <p className="text-sm text-gray-500">Inicia una nueva familia desde cero.</p>
            </div>
          </Link>

          <Link
            href="/house/join"
            className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition"
          >
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <LogIn size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900">Unirse a Casa Existente</h3>
              <p className="text-sm text-gray-500">Usa el nombre y contraseña que creó un familiar.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
