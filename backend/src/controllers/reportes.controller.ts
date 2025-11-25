import { Request, Response } from 'express'
import { createClientForUser } from '../config/supabase' // Usamos el cliente seguro

export class ReportesController {

  async getDashboardStats(req: Request, res: Response) {
    try {
      // 1. Seguridad: Validar token
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ success: false, error: "No autorizado" });
      
      const supabaseUser = createClientForUser(token);

      // 2. Consulta Segura (Respetando RLS)
      const { data: cotizaciones, error } = await supabaseUser
        .from('cotizaciones')
        .select(`
          id, total, estado, fecha_creacion, tipo_servicio,
          clientes ( nombre )
        `)
        .order('fecha_creacion', { ascending: true })

      if (error) throw error

      // 3. PROCESAMIENTO DE DATOS (Matemáticas simples)
      
      // A. KPIs Generales
      let totalCotizado = 0;
      let totalVendido = 0; // Solo estado 'aceptada'
      let conteoPorEstado = { borrador: 0, aceptada: 0, rechazada: 0 };

      // B. Datos para Gráfica Mensual (Ene, Feb, Mar...)
      const ventasPorMes: any = {}; // Ej: { "2023-11": 15000 }

      // C. Top Clientes
      const ventasPorCliente: any = {};

      cotizaciones?.forEach((cot: any) => {
        const monto = Number(cot.total) || 0;
        const estado = cot.estado || 'borrador';
        const fecha = new Date(cot.fecha_creacion);
        const mesKey = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`; // "2023-11"
        const nombreMes = fecha.toLocaleString('es-MX', { month: 'short' }); // "nov"

        // KPI Sumas
        totalCotizado += monto;
        if (estado === 'aceptada') {
          totalVendido += monto;
          
          // Sumar al cliente (Solo lo vendido cuenta para el Top)
          // Nota: Usamos optional chaining ?. por seguridad si clientes viene null
          const cliente = cot.clientes?.nombre || 'Desconocido';
          ventasPorCliente[cliente] = (ventasPorCliente[cliente] || 0) + monto;
        }

        // Conteo Estados
        // @ts-ignore
        conteoPorEstado[estado] = (conteoPorEstado[estado] || 0) + 1;

        // Historial Mensual (Sumamos todo lo cotizado para ver actividad)
        if (!ventasPorMes[mesKey]) {
          ventasPorMes[mesKey] = { name: nombreMes, cotizado: 0, ganado: 0, orden: fecha.getTime() };
        }
        ventasPorMes[mesKey].cotizado += monto;
        if (estado === 'aceptada') ventasPorMes[mesKey].ganado += monto;
      });

      // 4. FORMATEO PARA EL FRONTEND

      // Convertir objeto mensual a array ordenado para la gráfica
      const historyData = Object.values(ventasPorMes).sort((a: any, b: any) => a.orden - b.orden);

      // Convertir clientes a array y tomar el Top 5
      const topClientes = Object.entries(ventasPorCliente)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => (b.value as number) - (a.value as number))
        .slice(0, 5);

      // Datos del Pie Chart (Estados)
      const pieData = [
        { name: 'Ganadas', value: conteoPorEstado.aceptada, color: '#10B981' }, // Verde
        { name: 'Pendientes', value: conteoPorEstado.borrador, color: '#F59E0B' }, // Amarillo
        { name: 'Perdidas', value: conteoPorEstado.rechazada, color: '#EF4444' }, // Rojo
      ];

      res.json({
        success: true,
        data: {
          kpis: {
            totalCotizado,
            totalVendido,
            tasaConversion: totalCotizado > 0 ? ((totalVendido / totalCotizado) * 100).toFixed(1) : 0,
            totalCotizaciones: cotizaciones?.length || 0
          },
          chartData: historyData,
          pieData,
          topClientes
        }
      })

    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }
}

export default new ReportesController()