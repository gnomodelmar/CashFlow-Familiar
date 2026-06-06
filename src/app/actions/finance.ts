"use server";

import { prisma } from "@/lib/prisma";
import { requireHouse } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { syncAdjustmentTransaction } from "./savings";

export async function createCategory(name: string, type: "INCOME" | "EXPENSE", color: string) {
  const session = await requireHouse();

  await prisma.category.create({
    data: {
      name,
      type,
      color,
      houseId: session.houseId!,
    },
  });

  revalidatePath("/categories");
}

export async function deleteCategory(id: string) {
  const session = await requireHouse();

  // Basic validation - check if it has transactions or budgets
  const txCount = await prisma.transaction.count({ where: { categoryId: id } });
  if (txCount > 0) {
    return { error: "No se puede eliminar la categoría porque tiene transacciones asociadas." };
  }

  const budgetCount = await prisma.budget.count({ where: { categoryId: id } });
  if (budgetCount > 0) {
    return { error: "No se puede eliminar la categoría porque tiene presupuestos asociados." };
  }

  await prisma.category.delete({
    where: { id, houseId: session.houseId! },
  });

  revalidatePath("/categories");
  return { success: true };
}

export async function editCategory(id: string, name: string, type: "INCOME" | "EXPENSE", color: string) {
  const session = await requireHouse();

  await prisma.category.update({
    where: { id, houseId: session.houseId! },
    data: {
      name,
      type,
      color,
    },
  });

  revalidatePath("/categories");
  revalidatePath("/transactions");
  return { success: true };
}

export async function createTransaction(data: {
  amount: number;
  date: Date;
  description: string;
  type: "INCOME" | "EXPENSE" | "CC_PAYMENT";
  categoryId?: string;
  paymentMethod?: "CASH" | "CREDIT";
}) {
  const session = await requireHouse();

  await prisma.transaction.create({
    data: {
      amount: data.amount,
      date: data.date,
      description: data.description,
      type: data.type,
      categoryId: data.categoryId,
      paymentMethod: data.paymentMethod || "CASH",
      userId: session.userId,
      houseId: session.houseId!,
    },
  });

  // Re-sync savings if there is a manual saving set for this month
  const month = data.date.getMonth() + 1;
  const year = data.date.getFullYear();
  const summary = await prisma.monthlySummary.findUnique({
    where: { houseId_month_year: { houseId: session.houseId!, month, year } }
  });

  if (summary && summary.manualSavings !== null) {
    await syncAdjustmentTransaction(month, year, summary.manualSavings);
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/savings");
}

export async function editTransaction(
  id: string,
  data: {
    amount: number;
    date: Date;
    description: string;
    type: "INCOME" | "EXPENSE" | "CC_PAYMENT";
    categoryId?: string;
    paymentMethod?: "CASH" | "CREDIT";
  }
) {
  const session = await requireHouse();

  const tx = await prisma.transaction.update({
    where: { id, houseId: session.houseId! },
    data: {
      amount: data.amount,
      date: data.date,
      description: data.description,
      type: data.type,
      categoryId: data.categoryId,
      paymentMethod: data.paymentMethod || "CASH",
    },
  });

  const month = tx.date.getMonth() + 1;
  const year = tx.date.getFullYear();
  const summary = await prisma.monthlySummary.findUnique({
    where: { houseId_month_year: { houseId: tx.houseId, month, year } }
  });

  if (summary && summary.manualSavings !== null) {
    await syncAdjustmentTransaction(month, year, summary.manualSavings);
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/savings");
}

export async function deleteTransaction(id: string) {
  const session = await requireHouse();

  const tx = await prisma.transaction.delete({
    where: { id, houseId: session.houseId! },
  });

  // Re-sync savings if there is a manual saving set for this month
  const month = tx.date.getMonth() + 1;
  const year = tx.date.getFullYear();
  const summary = await prisma.monthlySummary.findUnique({
    where: { houseId_month_year: { houseId: tx.houseId, month, year } }
  });

  if (summary && summary.manualSavings !== null) {
    await syncAdjustmentTransaction(month, year, summary.manualSavings);
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/savings");
}
