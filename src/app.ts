import express from "express";
import cors from "cors";

// 1. CREAR LA APP DE EXPRESS
const app = express();

// 2. MIDDLEWARES GLOBALES
app.use(cors());           // Permite que un frontend en otro puerto se conecte sin ser bloqueado
app.use(express.json());   // Le enseña a Express a leer datos en formato JSON 

// 3. RUTAS
// Esta es una ruta de saludo básico para saber que el servidor está vivo
// Más adelante, aquí registraremos las rutas de propiedades y autenticación
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "API de Propiedades v1 funcionando 🚀" });
});

// 4. EXPORTAR LA APP
// Exportamos la configuración terminada
export default app;
