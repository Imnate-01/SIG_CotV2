import { Router } from "express";
import { registrarUsuario, loginUsuario } from "../controllers/auth.controller";

const router = Router();

// POST /api/auth/register
router.post("/register", registrarUsuario);

// POST /api/auth/login
router.post("/login", loginUsuario);

export default router;
