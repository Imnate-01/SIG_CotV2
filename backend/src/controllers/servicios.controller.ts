import { Request, Response } from 'express'
import { createClientForUser } from '../config/supabase' // Usamos el cliente seguro

export class ServiciosController {

  // OBTENER TODOS (Solo los activos)
  async getAll(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ success: false, error: "No autorizado" });

      const supabaseUser = createClientForUser(token);

      // Filtrar por region si viene como query param
      const region = req.query.region as string | undefined;
      let query = supabaseUser
        .from('servicios')
        .select('*')
        .eq('activo', true)
        .order('id');

      if (region) {
        query = query.eq('region', region.toUpperCase());
      }

      const { data, error } = await query;

      if (error) throw error
      res.json({ success: true, data })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // CREAR
  async create(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ success: false, error: "No autorizado" });

      const supabaseUser = createClientForUser(token);
      const { concepto, unidad, precio_sin_contrato, precio_con_contrato, moneda, categoria, region } = req.body

      const { data, error } = await supabaseUser
        .from('servicios')
        .insert({
          concepto, unidad, precio_sin_contrato, precio_con_contrato, moneda, categoria, region: region || 'MX'
        })
        .select()
        .single()

      if (error) throw error
      res.status(201).json({ success: true, data })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // ACTUALIZAR
  async update(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ success: false, error: "No autorizado" });

      const supabaseUser = createClientForUser(token);
      const { id } = req.params
      const updates = req.body

      const { data, error } = await supabaseUser
        .from('servicios')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      res.json({ success: true, data })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // ELIMINAR (Soft Delete - Solo desactivamos para no romper cotizaciones viejas)
  async delete(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ success: false, error: "No autorizado" });

      const supabaseUser = createClientForUser(token);
      const { id } = req.params

      const { error } = await supabaseUser
        .from('servicios')
        .update({ activo: false }) // Lo marcamos como inactivo
        .eq('id', id)

      if (error) throw error
      res.json({ success: true, message: 'Servicio desactivado correctamente' })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }
}

export default new ServiciosController()