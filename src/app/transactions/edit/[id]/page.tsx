import { requireHouse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditTransactionForm from "./EditTransactionForm";
import { redirect } from "next/navigation";

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireHouse();
  const { id } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { id, houseId: session.houseId! },
  });

  if (!transaction) {
    redirect("/transactions");
  }

  const categories = await prisma.category.findMany({
    where: { houseId: session.houseId! },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Link href="/transactions" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Editar Registro</h1>
      </div>

      <EditTransactionForm transaction={transaction} categories={categories} />
    </div>
  );
}
