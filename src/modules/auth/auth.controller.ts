// ===== PASO 6.3: Controller de autenticación =====
import { Request, Response } from "express";
import * as authService from "./auth.service";

export const login = async (req: Request, res: Response) => {
  // El body ya viene validado por el middleware validate (loginSchema)
  const result = await authService.login(req.body);
  res.json(result);
};
