import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewBudgetForm from "./NewBudgetForm";

export default async function NewBudgetPage() {
  await requireUser();

  const categories = await prisma.category.findMany({
    where: { type: "EXPENSE" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Link href="/budgets" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Nuevo Presupuesto</h1>
      </div>

      <NewBudgetForm categories={categories} />
    </div>
  );
}
