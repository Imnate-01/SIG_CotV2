import { Router } from 'express';
import reportesController from '../controllers/reportes.controller';

const router = Router();

router.get('/dashboard', reportesController.getDashboardStats);
router.post('/dashboard/prediction', reportesController.getPredictiveStats);

export default router;