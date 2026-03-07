"use client";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { Plus, Search, Edit, Trash2, MapPin, Phone, Mail, X, User } from "lucide-react";
import { toast } from "sonner";

// ✅ Tipo corregido
interface Cliente {
  id: number;
  nombre: string;               // Razón social / nombre fiscal
  empresa?: string | null;      // Nombre comercial
  contacto_nombre?: string | null; // ✅ Nuevo: nombre del contacto principal
  direccion?: string | null;
  colonia?: string | null;
  ciudad?: string | null;
  cp?: string | null;
  correo?: string | null;
  telefono?: string | null;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  // ✅ Form con contacto_nombre
  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    contacto_nombre: "",
    direccion: "",
    colonia: "",
    ciudad: "",
    cp: "",
    correo: "",
    telefono: "",
  });

  // 1) Cargar clientes (más robusto con data.data o data directo)
  const cargarClientes = async () => {
    try {
      const { data } = await api.get("/clientes");
      const lista: Cliente[] = Array.isArray(data) ? data : (data?.data ?? []);
      setClientes(lista);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // 2) Abrir modal crear/editar
  const abrirModal = (cliente?: Cliente) => {
    if (cliente) {
      setClienteEditando(cliente);
      setFormData({
        nombre: cliente.nombre ?? "",
        empresa: cliente.empresa ?? "",
        contacto_nombre: cliente.contacto_nombre ?? "", // ✅
        direccion: cliente.direccion ?? "",
        colonia: cliente.colonia ?? "",
        ciudad: cliente.ciudad ?? "",
        cp: cliente.cp ?? "",
        correo: cliente.correo ?? "",
        telefono: cliente.telefono ?? "",
      });
    } else {
      setClienteEditando(null);
      setFormData({
        nombre: "",
        empresa: "",
        contacto_nombre: "", // ✅
        direccion: "",
        colonia: "",
        ciudad: "",
        cp: "",
        correo: "",
        telefono: "",
      });
    }
    setModalAbierto(true);
  };

  // 3) Guardar
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (clienteEditando) {
        await api.put(`/clientes/${clienteEditando.id}`, formData);
        toast.success("Cliente actualizado");
      } else {
        await api.post("/clientes", formData);
        toast.success("Cliente creado");
      }
      setModalAbierto(false);
      cargarClientes();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar");
    }
  };

  // 4) Eliminar
  const handleEliminar = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar este cliente?")) return;
    try {
      await api.delete(`/clientes/${id}`);
      cargarClientes();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar");
    }
  };

  // Filtrado
  const clientesFiltrados = clientes.filter((c) =>
    (c.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.empresa || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.contacto_nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Directorio de Clientes</h1>
            <p className="text-gray-500 dark:text-gray-400">Administra empresas y contactos para tus cotizaciones</p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 dark:bg-blue-700 text-white px-5 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all flex items-center gap-2 font-semibold shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
          >
            <Plus size={20} />
            Nuevo Cliente
          </button>
        </div>

        {/* Búsqueda */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex items-center gap-3">
          <Search className="text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por razón social, empresa o contacto..."
            className="flex-1 outline-none text-gray-700 dark:text-gray-200 bg-transparent placeholder-gray-400 dark:placeholder-gray-500"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-3 text-center py-10 dark:text-gray-400">Cargando directorio...</p>
          ) : clientesFiltrados.length === 0 ? (
            <p className="col-span-3 text-center py-10 text-gray-500 dark:text-gray-400">No hay resultados.</p>
          ) : (
            clientesFiltrados.map((cliente) => (
              <div
                key={cliente.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                    {(cliente.nombre || "C").charAt(0)}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => abrirModal(cliente)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 bg-gray-50 hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-900/30 rounded-lg"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleEliminar(cliente.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 bg-gray-50 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate" title={cliente.nombre}>
                  {cliente.nombre}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate" title={cliente.empresa ?? ""}>
                  {cliente.empresa || "—"}
                </p>

                {/* ✅ Mostrar contacto_nombre */}
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                  <User size={14} className="text-gray-400 dark:text-gray-500" />
                  <span className="truncate" title={cliente.contacto_nombre ?? ""}>
                    {cliente.contacto_nombre || "Sin contacto principal"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-zinc-800 pt-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400 dark:text-gray-500" />
                    <span className="truncate">
                      {cliente.ciudad || "Sin ubicación"}{cliente.colonia ? `, ${cliente.colonia}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400 dark:text-gray-500" />
                    <span className="truncate">{cliente.correo || "Sin correo"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400 dark:text-gray-500" />
                    <span>{cliente.telefono || "Sin teléfono"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-transparent dark:border-zinc-800">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 z-10 transition-colors">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {clienteEditando ? "Editar Cliente" : "Registrar Nuevo Cliente"}
              </h2>
              <button onClick={() => setModalAbierto(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full dark:text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nombre Fiscal / Razón Social *</label>
                  <input
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all dark:placeholder-gray-500"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nombre Comercial (Empresa)</label>
                  <input
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all dark:placeholder-gray-500"
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  />
                </div>

                {/* Dirección */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Dirección (Calle y No.)</label>
                  <input
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all dark:placeholder-gray-500"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Colonia</label>
                  <input
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all dark:placeholder-gray-500"
                    value={formData.colonia}
                    onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Ciudad / Estado</label>
                  <input
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all dark:placeholder-gray-500"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Código Postal</label>
                  <input
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all dark:placeholder-gray-500"
                    value={formData.cp}
                    onChange={(e) => setFormData({ ...formData, cp: e.target.value })}
                  />
                </div>

                {/* Contacto */}
                <div className="col-span-2 border-t border-gray-100 dark:border-zinc-800 pt-4 mt-2">
                  <p className="text-sm font-bold text-gray-800 dark:text-white mb-3">Datos de Contacto Principal</p>
                </div>

                {/* ✅ NUEVO: Nombre del contacto */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nombre del Contacto</label>
                  <input
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all dark:placeholder-gray-500"
                    value={formData.contacto_nombre}
                    onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all dark:placeholder-gray-500"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                  <input
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all dark:placeholder-gray-500"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 dark:bg-blue-700 rounded-xl font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg transition-colors"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
