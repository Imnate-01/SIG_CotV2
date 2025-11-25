"use client";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { Plus, Search, Edit, Trash2, DollarSign, Clock, Package, X } from "lucide-react";

interface Servicio {
  id: number;
  concepto: string;
  unidad: string;
  precio_sin_contrato: number;
  precio_con_contrato: number;
  moneda: string;
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Modal y Formulario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null);
  
  const [formData, setFormData] = useState({
    concepto: "",
    unidad: "hora", // Default
    precio_sin_contrato: 0,
    precio_con_contrato: 0,
    moneda: "USD"
  });

  // Cargar
  const cargarServicios = async () => {
    try {
      const { data } = await api.get("/servicios");
      setServicios(data.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { cargarServicios(); }, []);

  // Abrir Modal
  const abrirModal = (servicio?: Servicio) => {
    if (servicio) {
      setServicioEditando(servicio);
      setFormData({
        concepto: servicio.concepto,
        unidad: servicio.unidad,
        precio_sin_contrato: servicio.precio_sin_contrato,
        precio_con_contrato: servicio.precio_con_contrato,
        moneda: servicio.moneda
      });
    } else {
      setServicioEditando(null);
      setFormData({ concepto: "", unidad: "hora", precio_sin_contrato: 0, precio_con_contrato: 0, moneda: "USD" });
    }
    setModalAbierto(true);
  };

  // Guardar
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (servicioEditando) {
        await api.put(`/servicios/${servicioEditando.id}`, formData);
      } else {
        await api.post("/servicios", formData);
      }
      setModalAbierto(false);
      cargarServicios();
      alert("Guardado correctamente");
    } catch (error) { alert("Error al guardar"); }
  };

  // Eliminar
  const handleEliminar = async (id: number) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    try {
      await api.delete(`/servicios/${id}`);
      cargarServicios();
    } catch (error) { alert("Error al eliminar"); }
  };

  const serviciosFiltrados = servicios.filter(s => 
    s.concepto.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Catálogo de Servicios</h1>
            <p className="text-gray-500">Gestiona las tarifas oficiales para cotizaciones ST y SM</p>
          </div>
          <button 
            onClick={() => abrirModal()}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 font-semibold shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            Nuevo Servicio
          </button>
        </div>

        {/* Búsqueda */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-3">
          <Search className="text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar concepto..."
            className="flex-1 outline-none text-gray-700"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? <p>Cargando...</p> : serviciosFiltrados.map((servicio) => (
            <div key={servicio.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group relative overflow-hidden">
              
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded uppercase flex items-center gap-1">
                    {servicio.unidad === 'hora' ? <Clock size={12}/> : <Package size={12}/>}
                    {servicio.unidad}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => abrirModal(servicio)} className="text-gray-400 hover:text-indigo-600"><Edit size={16}/></button>
                    <button onClick={() => handleEliminar(servicio.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                  </div>
                </div>

                <h3 className="font-bold text-gray-800 text-lg leading-tight mb-4 h-14 overflow-hidden">
                  {servicio.concepto}
                </h3>

                <div className="space-y-3">
                  {/* Precio SIN Contrato */}
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 font-semibold">Estándar</span>
                    <span className="font-bold text-gray-700">
                      ${servicio.precio_sin_contrato.toFixed(2)} <span className="text-xs">{servicio.moneda}</span>
                    </span>
                  </div>

                  {/* Precio CON Contrato */}
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-xs text-green-700 font-semibold">Con Contrato</span>
                    <span className="font-bold text-green-700">
                      ${servicio.precio_con_contrato.toFixed(2)} <span className="text-xs">{servicio.moneda}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {servicioEditando ? "Editar Servicio" : "Nueva Tarifa"}
              </h2>
              <button onClick={() => setModalAbierto(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Concepto / Descripción</label>
                <input required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={formData.concepto} onChange={e => setFormData({...formData, concepto: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Unidad</label>
                  <select className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={formData.unidad} onChange={e => setFormData({...formData, unidad: e.target.value})}>
                    <option value="hora">Hora</option>
                    <option value="dia">Día</option>
                    <option value="evento">Evento</option>
                    <option value="pieza">Pieza</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Moneda</label>
                  <select className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={formData.moneda} onChange={e => setFormData({...formData, moneda: e.target.value})}>
                    <option value="USD">USD</option>
                    <option value="MXN">MXN</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Precio Estándar</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">$</span>
                    <input type="number" step="0.01" className="w-full pl-8 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.precio_sin_contrato} onChange={e => setFormData({...formData, precio_sin_contrato: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-green-600 mb-1">Precio Contrato</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-green-600">$</span>
                    <input type="number" step="0.01" className="w-full pl-8 p-3 border border-green-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 bg-green-50 text-green-800 font-bold"
                      value={formData.precio_con_contrato} onChange={e => setFormData({...formData, precio_con_contrato: parseFloat(e.target.value)})} />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg mt-4">
                Guardar Servicio
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}