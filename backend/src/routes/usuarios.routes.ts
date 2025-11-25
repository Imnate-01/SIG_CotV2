import { Router } from 'express';
import usuariosController from '../controllers/usuarios.controller';

const router = Router();

router.get('/me', usuariosController.getMe);
router.put('/me', usuariosController.updateMe);
router.put('/me/password', usuariosController.updatePassword);
router.get('/', usuariosController.getAll);



export default router;