import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditFixedTaskForm from "./EditFixedTaskForm";
import { redirect } from "next/navigation";

export default async function EditFixedTaskPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const task = await prisma.fixedTask.findUnique({
    where: { id },
  });

  if (!task) {
    redirect("/agenda/config");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Link href="/agenda/config" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Editar Ítem Fijo</h1>
      </div>

      <EditFixedTaskForm task={task} categories={categories} />
    </div>
  );
}
