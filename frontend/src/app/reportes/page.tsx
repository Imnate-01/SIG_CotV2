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

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar Dashboard General
        const { data: dashboardData } = await api.get("/reportes/dashboard");
        setData(dashboardData.data);

        // Cargar Predicciones (No bloqueante, pero lo ponemos aquí simple)
        const { data: predictionRes } = await api.get("/reportes/dashboard/prediction");
        if (predictionRes.success) {
          setPrediction(predictionRes.data);

          // Combinar datos para la gráfica
          // Asumimos que predictionRes.data.prediction trae [{ mes: '2024-02', venta_estimada: 1200 }]
          // Y dashboardData.data.chartData trae [{ name: 'feb', cotizado: 100, ganado: 50, orden: ... }]
          // Vamos a mapear la predicción para agregarla visualmente

          const combinedChart = [...dashboardData.data.chartData];

          predictionRes.data.prediction.forEach((p: any) => {
            // Convertir YYYY-MM a nombre de mes corto
            const [y, m] = p.mes.split('-');
            const date = new Date(parseInt(y), parseInt(m) - 1, 1);
            const mesNombre = date.toLocaleString('es-MX', { month: 'short' });

            // Agregamos un punto de datos que soloc tiene 'pronostico'
            combinedChart.push({
              name: mesNombre + " (Est)",
              pronostico: p.venta_estimada,
              cotizado: 0,
              ganado: 0
            });
          });

          setData((prev: any) => ({ ...prev, chartData: combinedChart }));
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Calculando métricas...</div>;
  if (!data) return <div className="p-10 text-center">No hay datos disponibles</div>;

  // Formateador de moneda para los gráficos
  const formatMoney = (val: number) => `$${(val / 1000).toFixed(0)}k`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Métricas de Ventas</h1>
        <p className="text-gray-500 mb-8">Resumen ejecutivo del rendimiento comercial</p>

        {/* 0. INSIGHTS IA */}
        {prediction && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-6 rounded-2xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Brain size={120} className="text-purple-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-purple-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900">Análisis Predictivo IA</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {prediction.analisis}
                  </p>
                  {prediction.alerta && (
                    <div className="flex items-start gap-3 bg-white/60 p-3 rounded-lg border border-purple-100">
                      <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-gray-800 font-medium">{prediction.alerta}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white/50 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pronóstico Próximos 3 Meses</h4>
                  <div className="space-y-3">
                    {prediction.prediction.map((p: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-end border-b border-gray-100 pb-2 last:border-0">
                        <span className="text-sm text-gray-600">{p.mes}</span>
                        <span className="font-bold text-purple-700">${p.venta_estimada.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Rendimiento Mensual (USD)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={formatMoney} tick={{ fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Estatus de Cotizaciones</h3>
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
                  <span className="text-3xl font-bold text-gray-800">{data.kpis.totalCotizaciones}</span>
                  <p className="text-xs text-gray-400 uppercase">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TOP CLIENTES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Top 5 Clientes (Por Volumen Ganado)</h3>
          <div className="space-y-4">
            {data.topClientes.length === 0 ? (
              <p className="text-gray-400 text-sm">Aún no hay ventas registradas.</p>
            ) : (
              data.topClientes.map((cliente: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 text-gray-400 font-bold text-sm">#{index + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700">{cliente.name}</span>
                      <span className="font-bold text-gray-900">${cliente.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
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
    <div className={`p-6 rounded-2xl border ${color} flex items-start justify-between transition-transform hover:-translate-y-1`}>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className="p-3 bg-white rounded-xl shadow-sm">
        {icon}
      </div>
    </div>
  );
}