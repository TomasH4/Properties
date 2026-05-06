// ===== PASO 6.4: Rutas de autenticación =====
import { Router } from "express";
import * as controller from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { loginSchema } from "./auth.schema";

const router = Router();

// POST /api/v1/auth/login
// 1. validate valida el body con loginSchema
// 2. controller.login maneja la lógica
router.post("/login", validate({ body: loginSchema }), controller.login);

export default router;
