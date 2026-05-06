// ===== PASO 6.6 (apoyo Luis Carlos): Service de propiedades =====
import prisma from "../../db/prisma";
import { AppError } from "../../errors/AppError";
import { CreatePropertyInput, UpdatePropertyInput, PropertyQuery } from "./property.schema";

// Obtener todas las propiedades (con filtros y paginación opcionales)
export const getAll = async (query: PropertyQuery) => {
  const { location, minPrice, maxPrice, page, limit } = query;

  // Filtros dinámicos: solo se incluyen si se enviaron en la query
  const where: any = {};
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (minPrice !== undefined) where.price = { ...where.price, gte: minPrice };
  if (maxPrice !== undefined) where.price = { ...where.price, lte: maxPrice };

  // Calcular cuántos registros saltar para la paginación
  // Ejemplo: page=2, limit=10 → skip=10 (saltarse los primeros 10)
  const skip = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.property.count({ where }),
  ]);

  return {
    data: properties,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

// Obtener una propiedad por ID
export const getById = async (id: number) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError(404, "Property not found");
  return property;
};

// Crear una propiedad nueva
export const create = async (data: CreatePropertyInput) => {
  return prisma.property.create({ data });
};

// Actualizar una propiedad existente
export const update = async (id: number, data: UpdatePropertyInput) => {
  // Verificar que existe antes de actualizar
  await getById(id);
  return prisma.property.update({ where: { id }, data });
};

// Eliminar una propiedad
export const remove = async (id: number) => {
  // Verificar que existe antes de eliminar
  await getById(id);
  await prisma.property.delete({ where: { id } });
};
