"use client";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { useParams, useRouter } from "next/navigation";
import { 
  Save, 
  ArrowLeft, 
  FileCheck, 
  Trash2 // Importamos el icono de basura
} from "lucide-react";
import Link from "next/link";

export default function GestionCotizacion() {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Estado local para editar
  const [estado, setEstado] = useState("borrador");
  const [ordenCompra, setOrdenCompra] = useState("");
  const [estatusPO, setEstatusPO] = useState("pendiente");
  
  // Datos visuales (solo lectura)
  const [cotizacion, setCotizacion] = useState<any>(null);

  // 1. Cargar datos de la cotización actual
  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const { data } = await api.get(`/cotizaciones/${id}`);
        setCotizacion(data.data);
        // Rellenar formulario con datos actuales
        setEstado(data.data.estado || "borrador");
        setOrdenCompra(data.data.orden_compra || "");
        setEstatusPO(data.data.estatus_po || "pendiente");
      } catch (error) {
        alert("Error al cargar la cotización");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCotizacion();
  }, [id]);

  // 2. Guardar cambios
  const handleGuardarCambios = async () => {
    try {
      await api.put(`/cotizaciones/${id}/estado`, {
        estado,
        orden_compra: ordenCompra,
        estatus_po: estatusPO
      });
      alert("✅ Estado actualizado correctamente");
      router.push("/cotizaciones"); // Regresar al listado
    } catch (error) {
      alert("Error al actualizar");
    }
  };

  // 3. Eliminar Cotización (NUEVA FUNCIÓN)
  const handleEliminar = async () => {
    // Confirmación simple antes de borrar
    const confirmado = window.confirm("⚠️ ¿Estás seguro de que deseas ELIMINAR esta cotización?\n\nEsta acción es permanente y no se puede deshacer.");
    
    if (!confirmado) return;

    try {
      await api.delete(`/cotizaciones/${id}`);
      alert("🗑️ Cotización eliminada correctamente");
      router.push("/cotizaciones"); // Redirigir al tablero
    } catch (error) {
      console.error(error);
      alert("❌ Error al eliminar la cotización. Verifica que no tenga datos relacionados.");
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando detalles...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Botón Regresar */}
        <Link href="/cotizaciones" className="flex items-center text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft size={20} className="mr-2"/> Volver al tablero
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Encabezado */}
          <div className="bg-blue-600 p-8 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileCheck /> Gestión de Cotización
            </h2>
            <p className="opacity-90 mt-2">Folio: {cotizacion?.numero_cotizacion} — Cliente: {cotizacion?.clientes?.nombre}</p>
            <div className="mt-4 text-sm bg-white/20 p-2 rounded inline-block">
              Total: ${cotizacion?.total} USD
            </div>
          </div>

          {/* Formulario de Gestión */}
          <div className="p-8 space-y-6">
            
            {/* 1. Selector de Estado */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Estado de la Cotización</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="borrador">🟡 Borrador / Pendiente</option>
                <option value="aceptada">🟢 Aceptada (Ganada)</option>
                <option value="rechazada">🔴 Rechazada (Perdida)</option>
              </select>
            </div>

            {/* 2. Sección de PO (Solo visible si es Aceptada) */}
            {estado === "aceptada" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                   Datos de Orden de Compra (PO)
                </h3>
                
                <div className="grid gap-4">
                  <div>
                    <label className="block text-xs font-bold text-green-700 uppercase mb-1">Número de PO</label>
                    <input
                      type="text"
                      value={ordenCompra}
                      onChange={(e) => setOrdenCompra(e.target.value)}
                      placeholder="Ej: PO-450099123"
                      className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-green-700 uppercase mb-1">Estatus de la PO</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="po_status" 
                          value="pendiente"
                          checked={estatusPO === "pendiente"}
                          onChange={() => setEstatusPO("pendiente")}
                          className="accent-orange-500 w-5 h-5"
                        />
                        <span className="text-gray-700">Pendiente de pago/factura</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="po_status" 
                          value="completada"
                          checked={estatusPO === "completada"}
                          onChange={() => setEstatusPO("completada")}
                          className="accent-green-600 w-5 h-5"
                        />
                        <span className="text-gray-700 font-semibold">Completada</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                {/* Botón Guardar */}
                <button
                onClick={handleGuardarCambios}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                <Save size={24} />
                Guardar Cambios
                </button>

                {/* Botón Eliminar (Nuevo) */}
                <button
                onClick={handleEliminar}
                className="w-full bg-white text-red-600 border-2 border-red-100 py-3 rounded-xl font-bold text-lg hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                >
                <Trash2 size={20} />
                Eliminar Cotización
                </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}