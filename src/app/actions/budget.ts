"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createBudget(data: {
  amount: number;
  startDate: Date;
  endDate: Date;
  categoryId: string;
}) {
  await requireUser();

  await prisma.budget.create({
    data: {
      amount: data.amount,
      startDate: data.startDate,
      endDate: data.endDate,
      categoryId: data.categoryId,
    },
  });

  revalidatePath("/budgets");
  revalidatePath("/");
}

export async function deleteBudget(id: string) {
  await requireUser();

  await prisma.budget.delete({
    where: { id },
  });

  revalidatePath("/budgets");
  revalidatePath("/");
}
