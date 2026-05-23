import { Router } from "express";
import { registrarUsuario, loginUsuario, refreshToken } from "../controllers/auth.controller";

const router = Router();

// POST /api/auth/register
router.post("/register", registrarUsuario);

// POST /api/auth/login
router.post("/login", loginUsuario);

// POST /api/auth/refresh  — renueva el access_token usando el refresh_token (expira en 30 días)
router.post("/refresh", refreshToken);

export default router;
