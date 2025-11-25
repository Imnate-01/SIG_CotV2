import { Router } from 'express';
import serviciosController from '../controllers/servicios.controller';

const router = Router();

router.get('/', serviciosController.getAll);
router.post('/', serviciosController.create);
router.put('/:id', serviciosController.update);
router.delete('/:id', serviciosController.delete);


export default router;