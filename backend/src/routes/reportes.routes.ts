import { Router } from 'express';
import reportesController from '../controllers/reportes.controller';

const router = Router();

router.get('/dashboard', reportesController.getDashboardStats);

export default router;