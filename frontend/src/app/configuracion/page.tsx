"use client";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { User, Lock, Save, ShieldCheck, Building } from "lucide-react";

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("perfil");
  const [loading, setLoading] = useState(false);

  // Estados del formulario Perfil
  const [perfil, setPerfil] = useState({
    nombre: "",
    email: "",
    departamento: "",
    rol: ""
  });

  // Estados del formulario Password
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Cargar datos al inicio
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const { data } = await api.get("/usuarios/me");
        setPerfil({
          nombre: data.data.nombre || "",
          email: data.data.email || "",
          departamento: data.data.departamento || "",
          rol: data.data.rol || "vendedor"
        });
      } catch (error) {
        console.error("Error cargando perfil");
      }
    };
    cargarPerfil();
  }, []);

  // Guardar Perfil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put("/usuarios/me", {
        nombre: perfil.nombre,
        departamento: perfil.departamento
      });
      
      // Actualizar localStorage para que el Sidebar cambie al instante
      const userStorage = JSON.parse(localStorage.getItem("user_data") || "{}");
      localStorage.setItem("user_data", JSON.stringify({ ...userStorage, nombre: perfil.nombre }));
      
      alert("Perfil actualizado correctamente. Recarga la página para ver cambios en el menú.");
    } catch (error) {
      alert("Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  // Cambiar Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      return alert("La contraseña debe tener al menos 6 caracteres");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return alert("Las contraseñas no coinciden");
    }

    setLoading(true);
    try {
      await api.put("/usuarios/me/password", { password: passwords.newPassword });
      alert("Contraseña cambiada con éxito");
      setPasswords({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      alert("Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Configuración de Cuenta</h1>
        <p className="text-gray-500 mb-8">Administra tu información personal y seguridad</p>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR DE PESTAÑAS */}
          <div className="w-full md:w-64 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("perfil")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left ${
                activeTab === "perfil" ? "bg-white shadow-sm text-blue-600 border border-blue-100" : "text-gray-600 hover:bg-white/50"
              }`}
            >
              <User size={20} /> Información Personal
            </button>
            <button
              onClick={() => setActiveTab("seguridad")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left ${
                activeTab === "seguridad" ? "bg-white shadow-sm text-blue-600 border border-blue-100" : "text-gray-600 hover:bg-white/50"
              }`}
            >
              <Lock size={20} /> Seguridad
            </button>
          </div>

          {/* CONTENIDO */}
          <div className="flex-1">
            
            {/* PANEL PERFIL */}
            {activeTab === "perfil" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {perfil.nombre.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{perfil.nombre}</h2>
                    <p className="text-gray-500">{perfil.email}</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                      <input 
                        type="text" 
                        value={perfil.nombre}
                        onChange={(e) => setPerfil({...perfil, nombre: e.target.value})}
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Departamento / Área</label>
                      <input 
                        type="text" 
                        value={perfil.departamento}
                        onChange={(e) => setPerfil({...perfil, departamento: e.target.value})}
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-1">Correo Electrónico</label>
                      <input 
                        type="text" 
                        value={perfil.email}
                        disabled
                        className="w-full p-3 border bg-gray-50 rounded-xl text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Contacta a soporte para cambiar tu email.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-1">Rol de Usuario</label>
                      <div className="flex items-center gap-2 p-3 border bg-gray-50 rounded-xl text-gray-500">
                        <ShieldCheck size={16} />
                        <span className="capitalize">{perfil.rol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? "Guardando..." : <><Save size={18} /> Guardar Cambios</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PANEL SEGURIDAD */}
            {activeTab === "seguridad" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Cambiar Contraseña</h2>
                <p className="text-gray-500 mb-6">Asegúrate de usar una contraseña segura con letras, números y símbolos.</p>

                <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nueva Contraseña</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar Contraseña</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      disabled={loading}
                      className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? "Actualizando..." : <><Lock size={18} /> Actualizar Contraseña</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}