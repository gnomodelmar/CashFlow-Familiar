import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CashFlow Familiar",
  description: "Gestión de finanzas familiares",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CashFlow",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen text-gray-900">
        {children}
      </body>
    </html>
  );
}
