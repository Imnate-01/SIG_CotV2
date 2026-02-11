import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Usamos Inter, la fuente estándar moderna
import "./globals.css";
import ClientLayout from "@/components/ClientLayout"; // Importamos nuestro nuevo Wrapper
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner"; // Importamos el Toaster

// Cargamos la fuente
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Cotizaciones SIG",
  description: "Plataforma de gestión de servicios y materiales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          {/* Envolvemos todo con nuestro ClientLayout */}
          <ClientLayout>
            {children}
          </ClientLayout>
          {/* Componente Toaster para notificaciones */}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}