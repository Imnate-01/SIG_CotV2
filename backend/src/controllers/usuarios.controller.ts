import { Request, Response } from 'express'
// Importamos la función para crear el cliente seguro con el token del usuario
import { createClientForUser } from '../config/supabase'

export class UsuariosController {

  // ---------------------------------------------------------
  // 1. OBTENER TODOS LOS USUARIOS (Faltaba esta función)
  // ---------------------------------------------------------
  async getAll(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ success: false, message: 'No autorizado: Falta token' });
      }

      // Usamos el cliente seguro (identidad del usuario logueado)
      const supabaseUser = createClientForUser(token);

      // Traemos los datos necesarios para el selector
      const { data, error } = await supabaseUser
        .from('usuarios')
        .select('id, nombre, email, departamento, rol')
        .eq('activo', true) // Opcional: Solo usuarios activos
        .order('nombre')

      if (error) throw error

      res.json({ success: true, data })
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // ---------------------------------------------------------
  // 2. OBTENER MI PERFIL
  // ---------------------------------------------------------
  async getMe(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) return res.status(401).json({ message: 'No token provided' })

      const supabaseUser = createClientForUser(token);

      // Validar token real
      const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
      
      if (authError || !user) return res.status(401).json({ message: 'Token inválido o expirado' })

      // Buscar perfil
      const { data: perfil, error } = await supabaseUser
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      res.json({ success: true, data: { ...perfil, email: user.email } })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // ---------------------------------------------------------
  // 3. ACTUALIZAR MI PERFIL
  // ---------------------------------------------------------
  async updateMe(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) return res.status(401).json({ message: 'No token' })
      
      const supabaseUser = createClientForUser(token);
      
      const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
      if (authError || !user) return res.status(401).json({ message: 'Unauthorized' })

      const { nombre, departamento, telefono } = req.body

      const { data, error } = await supabaseUser
        .from('usuarios')
        .update({ 
          nombre, 
          departamento,
          // telefono: telefono 
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      res.json({ success: true, data })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // ---------------------------------------------------------
  // 4. CAMBIAR CONTRASEÑA
  // ---------------------------------------------------------
  async updatePassword(req: Request, res: Response) {
    try {
      const { password } = req.body
      const token = req.headers.authorization?.split(' ')[1]
      
      if (!token) return res.status(401).json({ message: 'No token' })

      const supabaseUser = createClientForUser(token);

      // Usamos la función segura para que el usuario cambie SU propia contraseña
      const { data, error } = await supabaseUser.auth.updateUser({
        password: password
      })

      if (error) throw error

      res.json({ success: true, message: 'Contraseña actualizada correctamente' })

    } catch (error: any) {
      console.error('Error al cambiar password:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }
}

export default new UsuariosController()