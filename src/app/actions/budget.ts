"use server";

import { prisma } from "@/lib/prisma";
import { requireHouse } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createBudget(data: {
  amount: number;
  startDate: Date;
  endDate: Date;
  categoryId: string;
}) {
  const session = await requireHouse();

  await prisma.budget.create({
    data: {
      amount: data.amount,
      startDate: data.startDate,
      endDate: data.endDate,
      categoryId: data.categoryId,
      houseId: session.houseId!,
    },
  });

  revalidatePath("/budgets");
  revalidatePath("/");
}

export async function deleteBudget(id: string) {
  const session = await requireHouse();

  await prisma.budget.delete({
    where: { id, houseId: session.houseId! },
  });

  revalidatePath("/budgets");
  revalidatePath("/");
}
