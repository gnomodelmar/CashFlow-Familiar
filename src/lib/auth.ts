"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "./session";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    redirect("/login");
  }

  return session;
}

export async function requireHouse() {
  const session = await requireUser();
  if (!session.houseId) {
    redirect("/house");
  }
  return session;
}

export async function login(name: string, pin: string) {
  const user = await prisma.user.findFirst({
    where: { name, pin },
  });

  if (user) {
    const session = await getSession();
    session.userId = user.id;
    session.name = user.name;
    session.houseId = user.houseId;
    await session.save();
    return { success: true };
  }

  return { success: false, error: "Usuario o PIN incorrecto." };
}

export async function register(name: string, pin: string) {
  try {
    const user = await prisma.user.create({
      data: { name, pin },
    });
    const session = await getSession();
    session.userId = user.id;
    session.name = user.name;
    session.houseId = null;
    await session.save();
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Ese nombre de usuario ya está en uso." };
  }
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
