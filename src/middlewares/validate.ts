// ===== PASO 4.1: Middleware genérico de validación con Zod =====
import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodRawShape } from "zod";
import { AppError } from "../errors/AppError";

// Tipo del parámetro: schemas opcionales para body, params y query
interface ValidationSchemas {
  body?: ZodObject<ZodRawShape>;
  params?: ZodObject<ZodRawShape>;
  query?: ZodObject<ZodRawShape>;
}

// Factory function: recibe schemas y RETORNA un middleware
export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const allErrors: { field: string; message: string }[] = [];

    // Iterar sobre cada schema pasado (body, params, query)
    for (const [key, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[key as keyof Request]);

      if (!result.success) {
        // Extraer errores de Zod y formatearlos
        const formatted = result.error.issues.map((issue: { path: (string | number)[]; message: string }) => ({
          field: issue.path.join("."), // ["price"] → "price"
          message: issue.message,
        }));
        allErrors.push(...formatted);
      } else {
        // Reemplazar el valor del request con el dato ya validado/coercionado
        Object.defineProperty(req, key, {
          value: result.data,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    }

    // Si hay errores, lanzar AppError con todos los errores de validación
    if (allErrors.length > 0) {
      // En Express 5 los errores de async llegan al errorHandler automáticamente
      // pero como validate no es async, usamos next(error)
      return next(
        Object.assign(new AppError(400, "Validation failed"), {
          errors: allErrors,
        })
      );
    }

    next();
  };
};
