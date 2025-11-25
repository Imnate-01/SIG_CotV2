"use client";
import React, { useState, useEffect } from "react";
import { X, ChevronRight, Check, LayoutDashboard, FilePlus, Bell } from "lucide-react";

export default function Onboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  // Pasos del Tour
  const steps = [
    {
      title: "¡Bienvenido a SIG System!",
      description: "Estamos felices de tenerte aquí. Vamos a dar un recorrido rápido para que domines tu nuevo sistema de cotizaciones en segundos.",
      icon: <div className="text-4xl">👋</div>,
      color: "bg-blue-600"
    },
    {
      title: "Tu Tablero de Control",
      description: "En 'Mis Cotizaciones' tendrás una vista panorámica de todo tu historial. Identifica rápidamente folios ST (Time & Material) y SM (Servicios Mensuales).",
      icon: <LayoutDashboard size={40} className="text-white" />,
      color: "bg-indigo-500"
    },
    {
      title: "Crea Cotizaciones al Instante",
      description: "Usa el botón 'Nueva Cotización' en el menú lateral. El sistema detectará automáticamente si es un cliente nuevo o recurrente.",
      icon: <FilePlus size={40} className="text-white" />,
      color: "bg-green-500"
    },
    {
      title: "Gestión de Aprobaciones",
      description: "Ahora puedes cambiar el estado de tus cotizaciones a 'Aceptada' y registrar el número de Orden de Compra (PO) directamente en el sistema.",
      icon: <Check size={40} className="text-white" />,
      color: "bg-purple-500"
    },
    {
      title: "¡Estás listo!",
      description: "Ya tienes todo lo necesario para empezar. Si tienes dudas, tu equipo de soporte está a un clic de distancia. ¡Éxito en tus ventas!",
      icon: <div className="text-4xl">🚀</div>,
      color: "bg-slate-800"
    }
  ];

  useEffect(() => {
    // Verificamos si el usuario ya vio el tour
    const tourVisto = localStorage.getItem("onboarding_completed");
    
    // Si NO lo ha visto, lo mostramos con un pequeño delay para que sea elegante
    if (!tourVisto) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Guardamos que ya lo vio para no molestar de nuevo
    localStorage.setItem("onboarding_completed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      
      {/* Fondo Oscuro con Blur (Backdrop) */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500"
        onClick={handleClose}
      />

      {/* Tarjeta del Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-500 scale-100 animate-in fade-in zoom-in-95">
        
        {/* Botón Cerrar */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Parte Superior: Visual e Ícono */}
        <div className={`${steps[step].color} h-40 flex items-center justify-center transition-colors duration-500 relative overflow-hidden`}>
          {/* Círculos decorativos de fondo */}
          <div className="absolute top-[-50%] left-[-20%] w-60 h-60 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-white opacity-10 rounded-full blur-xl"></div>
          
          {/* Ícono Central Animado */}
          <div className="relative z-10 transform transition-transform duration-500 scale-110">
             {steps[step].icon}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 transition-all duration-300">
            {steps[step].title}
          </h2>
          <p className="text-gray-500 text-base leading-relaxed min-h-[80px] transition-all duration-300">
            {steps[step].description}
          </p>

          {/* Indicadores de Progreso (Puntitos) */}
          <div className="flex justify-center gap-2 mt-6 mb-8">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? `w-8 ${steps[step].color.replace('bg-', 'bg-opacity-100 bg-')}` : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Botón de Acción */}
          <button
            onClick={handleNext}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 ${steps[step].color}`}
          >
            {step === steps.length - 1 ? (
              <>
                ¡Comenzar a trabajar! 🚀
              </>
            ) : (
              <>
                Siguiente <ChevronRight size={20} />
              </>
            )}
          </button>

          {/* Botón Saltar */}
          {step < steps.length - 1 && (
            <button 
              onClick={handleClose}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600 font-medium"
            >
              Saltar introducción
            </button>
          )}
        </div>
      </div>
    </div>
  );
}