// ===== PASO 6.2: Servicio de autenticación =====
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../db/prisma";
import { AppError } from "../../errors/AppError";
import { env } from "../../config/env";
import { LoginInput } from "./auth.schema";

export const login = async ({ email, password }: LoginInput) => {
  // 1. Buscar usuario por email
  const user = await prisma.user.findUnique({ where: { email } });

  // 2. Si no existe → error GENÉRICO (no revelar si el email existe o no)
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  // 3. Comparar la contraseña ingresada con el hash guardado en la DB
  const isValidPassword = await bcrypt.compare(password, user.password);

  // 4. Si no coincide → MISMO error genérico (seguridad)
  if (!isValidPassword) {
    throw new AppError(401, "Invalid credentials");
  }

  // 5. Generar JWT con los datos del usuario en el payload
  const token = jwt.sign(
    { userId: user.id, email: user.email }, // payload (datos dentro del token)
    env.JWT_SECRET,                          // clave secreta para firmar
    { expiresIn: "24h" }                     // el token expira en 24 horas
  );

  return { token };
};
