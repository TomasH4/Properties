// ===== PASO 6.5: Middleware de autenticación JWT =====
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { env } from "../config/env";

export const auth = (req: Request, _res: Response, next: NextFunction) => {
  // 1. Obtener el header Authorization
  const authHeader = req.headers.authorization;

  // 2. Verificar que existe y tiene el formato "Bearer TOKEN"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(401, "Access token is required");
  }

  // 3. Extraer el token (quitar "Bearer ")
  const token = authHeader.split(" ")[1];

  // 4. Verificar el token con la clave secreta
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      userId: number;
      email: string;
    };

    // 5. Adjuntar los datos del usuario al request para que el controller los use
    req.user = payload;

    // 6. Pasar al siguiente middleware o controller
    next();
  } catch (error) {
    // jwt.verify lanza error si el token es inválido o expiró
    throw new AppError(401, "Invalid or expired token");
  }
};
