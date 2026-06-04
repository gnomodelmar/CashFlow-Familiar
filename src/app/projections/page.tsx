import { requireHouse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectionsCalculator } from "./ProjectionsCalculator";

export default async function ProjectionsPage() {
  const session = await requireHouse();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get current month real data to use as base
  const transactions = await prisma.transaction.findMany({
    where: {
      houseId: session.houseId!,
      date: { gte: startOfMonth, lte: endOfMonth },
      type: { in: ["INCOME", "EXPENSE"] }
    }
  });

  const baseIncome = transactions
    .filter(t => t.type === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0) || 100000; // fallback if empty

  const baseExpense = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0) || 50000; // fallback if empty

  // Get fixed tasks
  const fixedTasks = await prisma.fixedTask.findMany({
    where: { active: true, houseId: session.houseId! }
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Proyecciones a Futuro</h1>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-indigo-900 text-sm">
        <p><strong>¿Cómo funciona?</strong> Se toman los ingresos y gastos reales del mes actual como base. Luego, se aplica la inflación y el crecimiento mensual a esa base. Los ítems fijos agendados se suman automáticamente aplicando también la inflación mes a mes.</p>
      </div>

      <ProjectionsCalculator
        baseIncome={baseIncome}
        baseExpense={baseExpense}
        fixedTasks={fixedTasks}
      />
    </div>
  );
}
