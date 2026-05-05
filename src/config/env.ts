import { z } from "zod";
import "dotenv/config";

// 1. DEFINIR EL ESQUEMA (Las reglas)
// Aquí le decimos a Zod cómo DEBEN verse nuestras variables de entorno
const envSchema = z.object({
  // DATABASE_URL debe ser un texto (string)
  // Además, le pedimos que verifique que tenga formato de URL si es posible
  DATABASE_URL: z.string().url("La URL de la base de datos debe ser una URL válida"),

  // JWT_SECRET debe ser un texto de al menos 10 caracteres
  JWT_SECRET: z.string().min(10, "El JWT_SECRET debe tener al menos 10 caracteres"),

  // PORT es tramposo: en el .env "3000" es texto, pero en el código queremos el número 3000
  // z.coerce.number() toma el texto "3000" y lo convierte automáticamente a número
  // Si no se proporciona en el .env, usa 3000 por defecto
  PORT: z.coerce.number().default(3000),
});

// 2. VALIDAR
// Intentamos aplicar las reglas (envSchema) a las variables actuales (process.env)
// Usamos safeParse para que si hay error, no explote todo inmediatamente, sino que nos dé un reporte
const _env = envSchema.safeParse(process.env);

// 3. MANEJAR ERRORES
// Si .success es false, significa que alguna regla no se cumplió (ej: falta el JWT_SECRET)
if (!_env.success) {
  console.error("Hay un error en tus variables de entorno (.env):");
  // Imprimimos el error formateado para que sea fácil de leer
  console.error(_env.error.format());

  // process.exit(1) le dice a Node.js: "¡Apaga el servidor inmediatamente con error!"
  // Es mejor morir rápido que funcionar mal
  process.exit(1);
}

// 4. EXPORTAR EL RESULTADO
// Si llegamos a este punto, todo salió bien.
// _env.data contiene nuestras variables ya validadas y con los tipos correctos (PORT ya es un número)
export const env = _env.data;
