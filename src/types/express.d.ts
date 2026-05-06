// ===== PASO 6.1: Extender el tipo Request de Express =====
// Este archivo NO se importa — TypeScript lo detecta automáticamente

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

// Necesario para que TypeScript trate el archivo como un módulo
export {};
