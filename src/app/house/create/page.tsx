import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import HouseForm from "../HouseForm";

export default async function CreateHousePage() {
  await requireUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 space-y-6 relative">
        <Link href="/house" className="absolute top-8 left-8 text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div className="text-center pt-2">
          <h1 className="text-2xl font-bold text-gray-900">Crear Casa</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Elegí un nombre único para tu familia y una contraseña para que otros se puedan unir.
          </p>
        </div>

        <HouseForm action="CREATE" />
      </div>
    </div>
  );
}
