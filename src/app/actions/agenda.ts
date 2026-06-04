"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { syncAdjustmentTransaction } from "./savings";

export async function createFixedTask(data: {
  name: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  dayOfMonth: number;
  categoryId?: string;
}) {
  await requireUser();

  await prisma.fixedTask.create({
    data: {
      name: data.name,
      amount: data.amount,
      type: data.type,
      dayOfMonth: data.dayOfMonth,
      categoryId: data.categoryId,
    },
  });

  revalidatePath("/agenda");
}

export async function deleteFixedTask(id: string) {
  await requireUser();

  // First delete instances
  await prisma.taskInstance.deleteMany({
    where: { fixedTaskId: id },
  });

  await prisma.fixedTask.delete({
    where: { id },
  });

  revalidatePath("/agenda");
}

export async function generateInstancesForMonth(month: number, year: number) {
  // 1. Get all active fixed tasks
  const activeTasks = await prisma.fixedTask.findMany({
    where: { active: true },
  });

  // 2. For each task, ensure an instance exists for the given month/year
  for (const task of activeTasks) {
    await prisma.taskInstance.upsert({
      where: {
        fixedTaskId_month_year: {
          fixedTaskId: task.id,
          month,
          year,
        },
      },
      update: {}, // Do nothing if it already exists
      create: {
        fixedTaskId: task.id,
        month,
        year,
        status: "PENDING",
      },
    });
  }
}

export async function processTaskInstance(
  instanceId: string,
  action: "PAY" | "CANCEL",
  finalAmount?: number
) {
  const session = await requireUser();

  const instance = await prisma.taskInstance.findUnique({
    where: { id: instanceId },
    include: { fixedTask: true },
  });

  if (!instance) return { error: "No se encontró el registro" };
  if (instance.status !== "PENDING") return { error: "La tarea ya fue procesada" };

  if (action === "CANCEL") {
    await prisma.taskInstance.update({
      where: { id: instanceId },
      data: { status: "CANCELLED" },
    });
  } else if (action === "PAY") {
    const amountToRegister = finalAmount ?? instance.fixedTask.amount;

    // 1. Mark as paid
    await prisma.taskInstance.update({
      where: { id: instanceId },
      data: {
        status: "PAID",
        finalAmount: amountToRegister
      },
    });

    // 2. Create the actual transaction in the cashflow
    // We construct a date using the month/year and the dayOfMonth
    const txDate = new Date(instance.year, instance.month - 1, instance.fixedTask.dayOfMonth);

    await prisma.transaction.create({
      data: {
        amount: amountToRegister,
        date: txDate,
        description: instance.fixedTask.name,
        type: instance.fixedTask.type,
        categoryId: instance.fixedTask.categoryId,
        userId: session.userId,
      },
    });

    // Re-sync savings if there is a manual saving set for this month
    const summary = await prisma.monthlySummary.findUnique({
      where: { month_year: { month: instance.month, year: instance.year } }
    });

    if (summary && summary.manualSavings !== null) {
      await syncAdjustmentTransaction(instance.month, instance.year, summary.manualSavings);
    }
  }

  revalidatePath("/agenda");
  revalidatePath("/transactions");
  revalidatePath("/savings");
  revalidatePath("/");
  return { success: true };
}
