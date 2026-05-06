// ===== app.ts: configuración principal de Express =====
// PASO 6.6: Integración de rutas de auth + errorHandler
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import propertyRoutes from "./modules/properties/property.routes";
import { errorHandler } from "./middlewares/errorHandler";

// 1. CREAR LA APP DE EXPRESS
const app = express();

// 2. MIDDLEWARES GLOBALES
app.use(cors());          // Permite que un frontend en otro puerto se conecte
app.use(express.json()); // Le enseña a Express a leer JSON del body

// 3. RUTAS
// Ruta base para verificar que el servidor está vivo
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "API de Propiedades v1 funcionando 🚀" });
});

// Rutas de autenticación (POST /api/v1/auth/login)
app.use("/api/v1/auth", authRoutes);

// Rutas de propiedades (GET/POST/PUT/DELETE /api/v1/properties)
app.use("/api/v1/properties", propertyRoutes);

// 4. ERROR HANDLER GLOBAL (debe ir ÚLTIMO, después de todas las rutas)
app.use(errorHandler);

// 5. EXPORTAR LA APP
export default app;
