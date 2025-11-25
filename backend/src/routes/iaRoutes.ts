import { Router } from 'express';
import { iaController } from '../controllers/iaController';

const router = Router();

// Definir los endpoints POST
// La ruta final será /api/ia/mejorar-texto, etc.
router.post('/mejorar-texto', iaController.mejorarTexto);
router.post('/extraer-cliente', iaController.extraerCliente);
router.post('/generar-correo', iaController.generarCorreo);

export default router;