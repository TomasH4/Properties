// ===== PASO 4.3: Schema de validación para autenticación =====
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Tipo TypeScript inferido del schema
export type LoginInput = z.infer<typeof loginSchema>;
