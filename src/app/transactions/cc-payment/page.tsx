import { requireHouse } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CCPaymentForm from "./CCPaymentForm";

export default async function CCPaymentPage() {
  await requireHouse();

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Pago de Tarjeta de Crédito</h1>
      </div>

      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-orange-800 text-sm">
        <p>Registrar un pago de tarjeta descontará el dinero de tu saldo bancario/efectivo y lo sumará al pago de tu deuda, <strong>sin registrarlo como un gasto duplicado</strong> en tus gráficos.</p>
      </div>

      <CCPaymentForm />
    </div>
  );
}
