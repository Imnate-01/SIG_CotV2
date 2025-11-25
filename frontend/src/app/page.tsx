"use client";
import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle2, 
  LayoutDashboard, 
  Zap, 
  ShieldCheck, 
  BarChart3 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      
      {/* 1. NAVBAR (Barra de navegación superior) */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
              S
            </div>
            <span className="font-bold text-xl tracking-tight">SIG System</span>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors hidden sm:block"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (La parte principal) */}
      <header className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 relative overflow-hidden">
        {/* Fondos decorativos (Glows) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-60" />
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Nueva Versión 2.0 Disponible
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            Cotizaciones inteligentes para <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              SIG Combibloc
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 fill-mode-both">
            Gestiona folios ST y SM, controla órdenes de compra y agiliza tus procesos comerciales en una sola plataforma centralizada.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
            <Link 
              href="/login"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Comenzar ahora <ArrowRight size={20} />
            </Link>
            <Link 
              href="/register"
              className="w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* 3. FEATURES GRID (Características) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Control Total</h3>
              <p className="text-slate-600 leading-relaxed">
                Distingue automáticamente entre cotizaciones Time & Material (ST) y Servicios Mensuales (SM) desde un único tablero.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Gestión Rápida</h3>
              <p className="text-slate-600 leading-relaxed">
                Crea cotizaciones en segundos. El sistema detecta clientes recurrentes y autocompleta la información fiscal.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Trazabilidad PO</h3>
              <p className="text-slate-600 leading-relaxed">
                Nunca pierdas de vista una Orden de Compra. Registra el número de PO y cambia el estatus a "Completada" al facturar.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. ESTADÍSTICAS / SOCIAL PROOF */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Diseñado para la eficiencia del equipo SAM</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="p-4">
              <div className="text-4xl font-extrabold text-blue-600 mb-2">+1.5k</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Cotizaciones</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-blue-600 mb-2">98%</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Aprobaciones</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-blue-600 mb-2">24/7</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Disponibilidad</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-blue-600 mb-2">100%</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Seguro</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA FINAL */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
         {/* Decoración de fondo */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para optimizar tu flujo de trabajo?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Únete al sistema y lleva el control de tus servicios de mantenimiento y materiales al siguiente nivel.
          </p>
          <Link 
            href="/login"
            className="inline-flex bg-white text-blue-900 hover:bg-blue-50 px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Acceder al Sistema
          </Link>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-slate-600 font-bold text-xs">S</div>
            <span className="font-bold text-slate-700">SIG System</span>
          </div>
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} SIG Combibloc. Todos los derechos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
}