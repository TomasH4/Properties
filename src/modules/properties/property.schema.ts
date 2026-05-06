// ===== PASO 4.2: Schemas de validación para propiedades =====
import { z } from "zod";

// Schema para crear una propiedad (body del POST)
export const createPropertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.number().positive("Price must be a positive number"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  available: z.boolean().default(true), // Si no se envía, es true por defecto
});

// Schema para actualizar: .partial() hace TODOS los campos opcionales
// Así puedes actualizar solo el precio, solo el título, etc.
export const updatePropertySchema = createPropertySchema.partial();

// Schema para el parámetro :id en la URL
// z.coerce convierte el string "42" → número 42 antes de validar
export const propertyIdSchema = z.object({
  id: z.coerce.number().int("ID must be an integer").positive("ID must be positive"),
});

// Schema para query params (filtros + paginación)
// z.coerce es necesario porque ?page=2 llega como string "2", no número 2
export const propertyQuerySchema = z.object({
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Tipos TypeScript inferidos del schema (no repetir la definición dos veces)
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyQuery = z.infer<typeof propertyQuerySchema>;
