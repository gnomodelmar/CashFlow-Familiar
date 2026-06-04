"use server";

import { prisma } from "@/lib/prisma";
import { requireHouse } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Calculates the current mathematical total for a specific month
 */
async function calculateMonthlyTotal(houseId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // We exclude the automatic adjustment transactions to get the REAL total
  const transactions = await prisma.transaction.findMany({
    where: {
      houseId,
      date: { gte: startDate, lte: endDate },
      type: { in: ["INCOME", "EXPENSE"] },
    },
  });

  const incomes = transactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0);

  return incomes - expenses;
}

/**
 * Creates or updates the adjustment transaction to match the manual savings
 */
export async function syncAdjustmentTransaction(month: number, year: number, manualSavings: number) {
  const session = await requireHouse();

  const realTotal = await calculateMonthlyTotal(session.houseId!, month, year);
  const difference = manualSavings - realTotal;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Find existing adjustment
  const existingAdjustment = await prisma.transaction.findFirst({
    where: {
      houseId: session.houseId!,
      date: { gte: startDate, lte: endDate },
      type: "ADJUSTMENT",
    },
  });

  if (Math.abs(difference) < 0.01) {
    // If difference is 0, we can delete the adjustment if it exists
    if (existingAdjustment) {
      await prisma.transaction.delete({ where: { id: existingAdjustment.id } });
    }
    return;
  }

  const adjustmentData = {
    amount: difference, // Can be positive or negative
    date: new Date(year, month - 1, 28), // Put it near the end of the month
    description: "Ajuste de Ahorro Mensual",
    type: "ADJUSTMENT",
    userId: session.userId,
    houseId: session.houseId!,
  };

  if (existingAdjustment) {
    await prisma.transaction.update({
      where: { id: existingAdjustment.id },
      data: adjustmentData,
    });
  } else {
    await prisma.transaction.create({
      data: adjustmentData,
    });
  }
}

export async function saveManualSavings(month: number, year: number, savings: number | null) {
  const session = await requireHouse();

  await prisma.monthlySummary.upsert({
    where: {
      houseId_month_year: { houseId: session.houseId!, month, year },
    },
    update: { manualSavings: savings },
    create: {
      month,
      year,
      manualSavings: savings,
      houseId: session.houseId!,
    },
  });

  if (savings !== null) {
    await syncAdjustmentTransaction(month, year, savings);
  } else {
    // If we remove the manual override, delete the adjustment transaction
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    await prisma.transaction.deleteMany({
      where: {
        houseId: session.houseId!,
        date: { gte: startDate, lte: endDate },
        type: "ADJUSTMENT",
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/savings");
  revalidatePath("/transactions");
}
