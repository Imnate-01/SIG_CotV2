"use client";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { DollarSign, TrendingUp, FileCheck, AlertCircle, Brain, Sparkles } from "lucide-react";

export default function ReportesPage() {
  const [data, setData] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [query, setQuery] = useState("");
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar Dashboard General
        const { data: dashboardData } = await api.get("/reportes/dashboard");
        setData(dashboardData.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const handleGeneratePrediction = async () => {
    setGenerating(true);
    try {
      const { data: predictionRes } = await api.post("/reportes/dashboard/prediction", {
        userQuery: query
      });

      if (predictionRes.success) {
        setPrediction(predictionRes.data);

        // Combinar datos para la gráfica
        const combinedChart = [...data.chartData];
        // Limpiar predicciones anteriores si las hubiera en el chart
        const cleanChart = combinedChart.filter(item => !item.name.includes("(Est)"));

        predictionRes.data.prediction.forEach((p: any) => {
          const [y, m] = p.mes.split('-');
          const date = new Date(parseInt(y), parseInt(m) - 1, 1);
          const mesNombre = date.toLocaleString('es-MX', { month: 'short' });

          cleanChart.push({
            name: mesNombre + " (Est)",
            pronostico: p.venta_estimada,
            cotizado: 0,
            ganado: 0
          });
        });

        setData((prev: any) => ({ ...prev, chartData: cleanChart }));
        setShowInput(false); // Ocultar input tras generar
      }
    } catch (error) {
      console.error("Error generando predicción", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Calculando métricas...</div>;
  if (!data) return <div className="p-10 text-center">No hay datos disponibles</div>;

  // Formateador de moneda para los gráficos
  const formatMoney = (val: number) => `$${(val / 1000).toFixed(0)}k`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Métricas de Ventas</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Resumen ejecutivo del rendimiento comercial</p>

        {/* 0. INSIGHTS IA (ON-DEMAND) */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800 p-6 rounded-2xl mb-8 relative overflow-hidden transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Brain size={120} className="text-purple-600" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Inteligencia de Negocios & Predicción</h3>
            </div>

            {!prediction && !generating && !showInput && (
              <div className="flex flex-col items-start gap-4">
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                  Utiliza nuestra IA para analizar tus ventas históricas, detectar tendencias y pronosticar los ingresos de los próximos trimestres. Puedes hacer preguntas específicas.
                </p>
                <button
                  onClick={() => setShowInput(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 dark:shadow-none transition-all flex items-center gap-2"
                >
                  <Brain size={18} /> Iniciar Análisis Predictivo
                </button>
              </div>
            )}

            {(showInput || generating) && !prediction && (
              <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  ¿Tienes alguna pregunta específica para la IA? (Opcional)
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: ¿Cómo afectará la baja de ventas en diciembre a mi Q1? o simplemente déjalo en blanco para un análisis general."
                  className="w-full p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-black/40 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none mb-4 min-h-[100px]"
                  disabled={generating}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleGeneratePrediction}
                    disabled={generating}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <Sparkles className="animate-spin" size={18} /> Analizando Datos...
                      </>
                    ) : (
                      <>Generar Predicción</>
                    )}
                  </button>
                  {!generating && (
                    <button
                      onClick={() => setShowInput(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-4 py-3 font-medium"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )}

            {prediction && (
              <div className="animate-in fade-in zoom-in-95">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-2 uppercase tracking-wider">Análisis Estratégico</h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-lg">
                      {prediction.analisis}
                    </p>
                    {prediction.alerta && (
                      <div className="flex items-start gap-3 bg-white/60 dark:bg-black/40 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-100">
                        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="font-bold text-sm">Observación Importante</p>
                          <p className="text-sm opacity-90">{prediction.alerta}</p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => { setPrediction(null); setShowInput(true); setQuery(""); }}
                      className="mt-6 text-sm text-purple-600 dark:text-purple-400 font-bold hover:underline"
                    >
                      Realizar nueva consulta
                    </button>
                  </div>

                  <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-white/20">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Pronóstico Próximos 3 Meses</h4>
                    <div className="space-y-4">
                      {prediction.prediction.map((p: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-end border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
                          <span className="text-base font-medium text-gray-600 dark:text-gray-400 capitalize">
                            {/* Formato seguro de fecha para visualización rápida */}
                            {p.mes}
                          </span>
                          <span className="text-xl font-bold text-purple-700 dark:text-purple-400">${p.venta_estimada.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-center text-gray-400">
                      * Estimación basada en histórico. No garantiza resultados futuros.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1. KPIS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <CardKPI
            title="Total Vendido (Ganado)"
            value={`$${data.kpis.totalVendido.toLocaleString()}`}
            icon={<DollarSign className="text-green-600" />}
            color="bg-green-50 border-green-100"
          />

          <CardKPI
            title="Total Cotizado (Pipeline)"
            value={`$${data.kpis.totalCotizado.toLocaleString()}`}
            icon={<TrendingUp className="text-blue-600" />}
            color="bg-blue-50 border-blue-100"
          />

          <CardKPI
            title="Tasa de Conversión"
            value={`${data.kpis.tasaConversion}%`}
            icon={<FileCheck className="text-indigo-600" />}
            color="bg-indigo-50 border-indigo-100"
          />

          <CardKPI
            title="Cotizaciones Totales"
            value={data.kpis.totalCotizaciones}
            icon={<AlertCircle className="text-orange-600" />}
            color="bg-orange-50 border-orange-100"
          />
        </div>

        {/* 2. GRÁFICOS PRINCIPALES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Gráfica de Barras: Historia Mensual */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Rendimiento Mensual (USD)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" className="opacity-30" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={formatMoney} tick={{ fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', backgroundColor: '#18181b', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number | undefined) => value !== undefined ? [`$${value.toLocaleString()}`, ''] : ['', '']}
                  />
                  <Legend />
                  <Bar dataKey="cotizado" name="Cotizado" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ganado" name="Vendido" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pronostico" name="Pronóstico IA" fill="#A855F7" radius={[4, 4, 0, 0]} strokeDasharray="5 5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica de Pastel: Estatus */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Estatus de Cotizaciones</h3>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              {/* Texto central */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-800 dark:text-white">{data.kpis.totalCotizaciones}</span>
                  <p className="text-xs text-gray-400 uppercase">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TOP CLIENTES */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Top 5 Clientes (Por Volumen Ganado)</h3>
          <div className="space-y-4">
            {data.topClientes.length === 0 ? (
              <p className="text-gray-400 text-sm">Aún no hay ventas registradas.</p>
            ) : (
              data.topClientes.map((cliente: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 text-gray-400 font-bold text-sm">#{index + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{cliente.name}</span>
                      <span className="font-bold text-gray-900 dark:text-white">${cliente.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(cliente.value / data.kpis.totalVendido) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Componente auxiliar para tarjetas
function CardKPI({ title, value, icon, color }: any) {
  return (
    <div className={`p-6 rounded-2xl border ${color.replace('bg-', 'bg-opacity-10 dark:bg-opacity-5 ').replace('border-', 'dark:border-opacity-20 ')} dark:border-opacity-50 flex items-start justify-between transition-transform hover:-translate-y-1`}>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
      </div>
      <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
        {icon}
      </div>
    </div>
  );
}