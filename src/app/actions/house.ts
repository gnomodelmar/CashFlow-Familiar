"use server";

import { prisma } from "@/lib/prisma";
import { requireUser, getSession } from "@/lib/auth";

export async function createHouse(name: string, password: string) {
  const session = await requireUser();

  try {
    const house = await prisma.house.create({
      data: { name, password },
    });

    await prisma.user.update({
      where: { id: session.userId },
      data: { houseId: house.id },
    });

    const currentSession = await getSession();
    currentSession.houseId = house.id;
    await currentSession.save();

    return { success: true };
  } catch (error) {
    console.error("Error creating house:", error);
    return { success: false, error: "El nombre de la casa ya está en uso." };
  }
}

export async function joinHouse(name: string, password: string) {
  const session = await requireUser();

  const house = await prisma.house.findUnique({
    where: { name },
  });

  if (!house || house.password !== password) {
    return { success: false, error: "Nombre de casa o contraseña incorrectos." };
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { houseId: house.id },
  });

  const currentSession = await getSession();
  currentSession.houseId = house.id;
  await currentSession.save();

  return { success: true };
}
