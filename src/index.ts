import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Crear la aplicación de Express
const app = express();

// Middlewares globales
app.use(cors());           // Permitir peticiones desde otros orígenes (frontend)
app.use(express.json());   // Parsear el body de las peticiones como JSON

// Puerto del servidor (desde .env o 3000 por defecto)
const PORT = process.env.PORT || 3000;

// Ruta de prueba para verificar que el servidor funciona
app.get("/", (_req, res) => {
  res.json({ message: "API de Propiedades funcionando 🏠" });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
