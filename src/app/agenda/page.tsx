import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { generateInstancesForMonth } from "../actions/agenda";
import { AgendaList } from "./AgendaList";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  await requireUser();
  const params = await searchParams;

  const now = new Date();
  const month = params?.month ? parseInt(params.month) : now.getMonth() + 1;
  const year = params?.year ? parseInt(params.year) : now.getFullYear();

  // Make sure instances are generated for this month
  await generateInstancesForMonth(month, year);

  const instances = await prisma.taskInstance.findMany({
    where: { month, year },
    include: { fixedTask: true },
    orderBy: { fixedTask: { dayOfMonth: "asc" } },
  });

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold">Agenda</h1>
        </div>
        <Link
          href="/agenda/config"
          className="text-gray-500 hover:text-indigo-600 p-2"
        >
          <Settings size={24} />
        </Link>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow">
        <Link
          href={`/agenda?month=${month === 1 ? 12 : month - 1}&year=${month === 1 ? year - 1 : year}`}
          className="text-indigo-600 font-medium"
        >
          &larr; Anterior
        </Link>
        <h2 className="text-lg font-bold">
          {monthNames[month - 1]} {year}
        </h2>
        <Link
          href={`/agenda?month=${month === 12 ? 1 : month + 1}&year=${month === 12 ? year + 1 : year}`}
          className="text-indigo-600 font-medium"
        >
          Siguiente &rarr;
        </Link>
      </div>

      <AgendaList instances={instances} />
    </div>
  );
}
