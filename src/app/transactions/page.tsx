import { requireHouse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, ArrowLeft, Trash2 } from "lucide-react";
import { deleteTransaction } from "../actions/finance";
import { format } from "date-fns";
import TransactionFilters from "./components/TransactionFilters";
import { Prisma } from "@prisma/client";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await requireHouse();
  const resolvedSearchParams = await searchParams;

  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
  const categoryId = typeof resolvedSearchParams.categoryId === 'string' ? resolvedSearchParams.categoryId : undefined;
  const dateFrom = typeof resolvedSearchParams.dateFrom === 'string' ? resolvedSearchParams.dateFrom : undefined;
  const dateTo = typeof resolvedSearchParams.dateTo === 'string' ? resolvedSearchParams.dateTo : undefined;

  const whereClause: Prisma.TransactionWhereInput = {
    houseId: session.houseId!,
  };

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (dateFrom || dateTo) {
    whereClause.date = {};
    if (dateFrom) {
      whereClause.date.gte = new Date(dateFrom);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setUTCHours(23, 59, 59, 999);
      whereClause.date.lte = toDate;
    }
  }

  if (search) {
    const searchNum = parseFloat(search);
    const orConditions: Prisma.TransactionWhereInput[] = [
      { description: { contains: search } },
      { category: { name: { contains: search } } },
    ];

    if (!isNaN(searchNum)) {
      orConditions.push({ amount: { equals: searchNum } });
    }

    whereClause.OR = orConditions;
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
    include: { category: true, user: true },
    take: 100, // Increased limit slightly since we have filters
  });

  const categories = await prisma.category.findMany({
    where: { houseId: session.houseId! },
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold">Movimientos</h1>
        </div>
        <Link
          href="/transactions/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <PlusCircle size={18} />
          <span className="hidden sm:inline">Nuevo Registro</span>
        </Link>
      </div>

      <TransactionFilters categories={categories} />

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {transactions.map((tx) => (
            <li key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                    ${tx.type === "INCOME" ? "bg-green-500" : tx.type === "EXPENSE" ? "bg-red-500" : "bg-gray-500"}
                  `}
                >
                  {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : "~"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {tx.description || tx.category?.name || "Ajuste"}
                  </p>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{format(new Date(tx.date), "dd/MM/yyyy")}</span>
                    {tx.category && (
                      <>
                        <span>•</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] text-white"
                          style={{ backgroundColor: tx.category.color || "#ccc" }}
                        >
                          {tx.category.name}
                        </span>
                      </>
                    )}
                    {tx.user && (
                      <>
                        <span>•</span>
                        <span>{tx.user.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === "INCOME" ? "text-green-600" : tx.type === "EXPENSE" ? "text-red-600" : "text-gray-600"}`}>
                    ${tx.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </p>
                  {tx.paymentMethod === "CREDIT" && (
                    <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">TC</span>
                  )}
                </div>
                <Link href={`/transactions/edit/${tx.id}`} className="text-gray-400 hover:text-indigo-600 text-sm font-medium">
                  Editar
                </Link>
                <form action={async () => {
                  "use server";
                  await deleteTransaction(tx.id);
                }}>
                  <button type="submit" className="text-gray-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </form>
              </div>
            </li>
          ))}
          {transactions.length === 0 && (
            <li className="p-8 text-center text-gray-500">
              Aún no hay movimientos registrados
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
