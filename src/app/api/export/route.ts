import { requireHouse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await requireHouse();

    const transactions = await prisma.transaction.findMany({
      where: { houseId: session.houseId! },
      orderBy: { date: "desc" },
      include: {
        category: true,
        user: true
      }
    });

    // Generate CSV content
    const headers = ["Fecha", "Tipo", "Categoria", "Descripcion", "Monto", "Usuario"];

    const rows = transactions.map(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      const type = t.type === "INCOME" ? "Ingreso" : t.type === "EXPENSE" ? "Gasto" : "Ajuste";
      const category = t.category?.name || "";
      const desc = t.description || "";
      const amount = t.amount.toString();
      const user = t.user?.name || "";

      // Escape commas in strings
      return [
        date,
        type,
        `"${category}"`,
        `"${desc}"`,
        amount,
        `"${user}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="cashflow_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (_error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
