"use client";
import React, { useEffect, useState } from "react";
import api from "@/services/api"; // Asegúrate de importar tu cliente API
import { Eye, FileText, Search, Filter } from "lucide-react";
import Link from "next/link";

interface Cotizacion {
  id: number;
  numero_cotizacion: string;
  fecha_creacion: string;
  total: number;
  estado: string;
  estatus_po: string;
  clientes: { nombre: string; empresa: string };
  usuarios: { nombre: string }; // El creador
  creado_por_nombre: string;
}

export default function DashboardCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data } = await api.get("/cotizaciones");
        setCotizaciones(data.data);
      } catch (error) {
        console.error("Error cargando cotizaciones:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // Función para el color del estado (Badge)
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "aceptada": return "bg-green-100 text-green-800";
      case "rechazada": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800"; // borrador/pendiente
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mis Cotizaciones</h1>
            <p className="text-gray-500">Historial completo de servicios y materiales</p>
          </div>
          <Link 
            href="/cotizaciones/nueva" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            + Nueva Cotización
          </Link>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100 text-gray-700 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Folio</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Creado por</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">PO Status</th>
                  <th className="px-6 py-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8">Cargando...</td></tr>
                ) : cotizaciones.map((cot) => (
                  <tr key={cot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {cot.numero_cotizacion}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{cot.clientes?.empresa || cot.clientes?.nombre}</div>
                    </td>
                    <td className="px-6 py-4">
                      {cot.creado_por_nombre} {/* Nombre del usuario que hizo login */}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(cot.fecha_creacion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getEstadoColor(cot.estado)}`}>
                        {cot.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {cot.estado === 'aceptada' ? (
                        cot.estatus_po === 'completada' 
                          ? <span className="text-green-600 font-bold flex items-center gap-1">● Completada</span>
                          : <span className="text-orange-500 font-bold flex items-center gap-1">● Pendiente</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* Botón que lleva a la OTRA PÁGINA de detalles */}
                      <Link 
                        href={`/cotizaciones/${cot.id}`} 
                        className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={20} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}