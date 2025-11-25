import { Request, Response } from "express";
import pool from "../config/db";

export const comprobarBD = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({
      ok: true,
      message: "Conexión a la BD correcta ✅",
      now: result.rows[0].now,
    });
  } catch (error) {
    console.error("Error al conectar a la BD:", error);
    res.status(500).json({
      ok: false,
      message: "Error al conectar a la base de datos",
    });
  }
};
