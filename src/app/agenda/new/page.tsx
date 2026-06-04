import { requireHouse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewFixedTaskForm from "./NewFixedTaskForm";

export default async function NewFixedTaskPage() {
  const session = await requireHouse();

  const categories = await prisma.category.findMany({
    where: { houseId: session.houseId! },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Link href="/agenda/config" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Nuevo Ítem Fijo</h1>
      </div>

      <NewFixedTaskForm categories={categories} />
    </div>
  );
}
