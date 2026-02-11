import { Router } from 'express';
import reportesController from '../controllers/reportes.controller';

const router = Router();

router.get('/dashboard', reportesController.getDashboardStats);
router.get('/dashboard/prediction', reportesController.getPredictiveStats);

export default router;