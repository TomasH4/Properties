// ===== AppError: clase para errores de la aplicación =====
// Se usa en toda la app para lanzar errores con código HTTP + mensaje

export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);        // Llama al constructor de Error con el mensaje
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
