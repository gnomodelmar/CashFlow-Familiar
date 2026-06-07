"use server";

import { requireHouse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPlannedEvent(formData: FormData) {
  const session = await requireHouse();

  const title = formData.get("title") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const month = parseInt(formData.get("month") as string);
  const year = parseInt(formData.get("year") as string);

  if (!title || isNaN(amount) || !type || isNaN(month) || isNaN(year)) {
    throw new Error("Missing required fields");
  }

  await prisma.plannedEvent.create({
    data: {
      title,
      amount,
      type,
      month,
      year,
      houseId: session.houseId!
    }
  });

  revalidatePath("/projections");
}

export async function deletePlannedEvent(id: string) {
  const session = await requireHouse();

  // Ensure the event belongs to the current house
  const event = await prisma.plannedEvent.findUnique({
    where: { id }
  });

  if (!event || event.houseId !== session.houseId) {
    throw new Error("Unauthorized or not found");
  }

  await prisma.plannedEvent.delete({
    where: { id }
  });

  revalidatePath("/projections");
}
