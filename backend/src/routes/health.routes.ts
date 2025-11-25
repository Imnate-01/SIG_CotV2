import { Router } from "express";
import { comprobarBD } from "../controllers/health.controller";

const router = Router();

// GET /api/health-db
router.get("/", comprobarBD);

export default router;
