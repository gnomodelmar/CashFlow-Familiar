"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { syncAdjustmentTransaction } from "./savings";

export async function createCategory(name: string, type: "INCOME" | "EXPENSE", color: string) {
  await requireUser();

  await prisma.category.create({
    data: {
      name,
      type,
      color,
    },
  });

  revalidatePath("/categories");
}

export async function deleteCategory(id: string) {
  await requireUser();

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
    where: { id },
  });

  revalidatePath("/categories");
  return { success: true };
}

export async function createTransaction(data: {
  amount: number;
  date: Date;
  description: string;
  type: "INCOME" | "EXPENSE";
  categoryId?: string;
}) {
  const session = await requireUser();

  await prisma.transaction.create({
    data: {
      amount: data.amount,
      date: data.date,
      description: data.description,
      type: data.type,
      categoryId: data.categoryId,
      userId: session.userId,
    },
  });

  // Re-sync savings if there is a manual saving set for this month
  const month = data.date.getMonth() + 1;
  const year = data.date.getFullYear();
  const summary = await prisma.monthlySummary.findUnique({
    where: { month_year: { month, year } }
  });

  if (summary && summary.manualSavings !== null) {
    await syncAdjustmentTransaction(month, year, summary.manualSavings);
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/savings");
}

export async function deleteTransaction(id: string) {
  await requireUser();

  const tx = await prisma.transaction.delete({
    where: { id },
  });

  // Re-sync savings if there is a manual saving set for this month
  const month = tx.date.getMonth() + 1;
  const year = tx.date.getFullYear();
  const summary = await prisma.monthlySummary.findUnique({
    where: { month_year: { month, year } }
  });

  if (summary && summary.manualSavings !== null) {
    await syncAdjustmentTransaction(month, year, summary.manualSavings);
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/savings");
}
