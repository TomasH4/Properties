// ===== Error Handler global de Express =====
// Captura todos los errores pasados con next(error) o throw (Express 5)
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

// Tipo extendido para errores que también pueden tener validation errors
interface AppErrorWithExtras extends AppError {
  errors?: { field: string; message: string }[];
}

export const errorHandler = (
  err: AppErrorWithExtras | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Si es un AppError (error controlado), usamos su statusCode
  if (err instanceof AppError) {
    const appErr = err as AppErrorWithExtras;
    const body: Record<string, unknown> = {
      status: "error",
      statusCode: appErr.statusCode,
      message: appErr.message,
    };

    // Si tiene errores de validación (vienen del middleware validate)
    if (appErr.errors) {
      body.errors = appErr.errors;
    }

    res.status(appErr.statusCode).json(body);
    return;
  }

  // Error inesperado → 500 Internal Server Error
  console.error("Error inesperado:", err);
  res.status(500).json({
    status: "error",
    statusCode: 500,
    message: "Internal server error",
  });
};
