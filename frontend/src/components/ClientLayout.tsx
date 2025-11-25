"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Onboarding from "./Onboarding"; // <--- 1. IMPORTAMOS EL COMPONENTE

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Rutas públicas donde NO debe salir ni el Menú ni el Onboarding
  // (Login, Registro y la Landing Page "/")
  const rutasFullPage = ["/login", "/register", "/"];
  const esFullPage = rutasFullPage.includes(pathname);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* 2. AQUI VA EL ONBOARDING */}
      {/* Solo se renderiza si estamos dentro del sistema. */}
      {/* El componente internamente decide si mostrarse o no (revisando localStorage) */}
      {!esFullPage && <Onboarding />}

      {/* Menú Lateral */}
      {!esFullPage && <Sidebar />}

      {/* Contenido Principal */}
      <main 
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          !esFullPage ? "lg:pl-64" : ""
        }`}
      >
        <div className={!esFullPage ? "" : ""}> 
          {children}
        </div>
      </main>
    </div>
  );
}