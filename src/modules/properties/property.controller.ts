// ===== PASO 6.6 (apoyo Luis Carlos): Controller de propiedades =====
import { Request, Response } from "express";
import * as propertyService from "./property.service";
import { PropertyQuery, CreatePropertyInput, UpdatePropertyInput } from "./property.schema";

// GET /api/v1/properties?location=...&minPrice=...&page=...
export const getAll = async (req: Request, res: Response) => {
  const result = await propertyService.getAll(req.query as unknown as PropertyQuery);
  res.json(result);
};

// GET /api/v1/properties/:id
export const getById = async (req: Request, res: Response) => {
  const property = await propertyService.getById(Number(req.params.id));
  res.json(property);
};

// POST /api/v1/properties (protegido con auth)
export const create = async (req: Request, res: Response) => {
  const property = await propertyService.create(req.body as CreatePropertyInput);
  res.status(201).json(property);
};

// PUT /api/v1/properties/:id (protegido con auth)
export const update = async (req: Request, res: Response) => {
  const property = await propertyService.update(Number(req.params.id), req.body as UpdatePropertyInput);
  res.json(property);
};

// DELETE /api/v1/properties/:id (protegido con auth)
export const remove = async (req: Request, res: Response) => {
  await propertyService.remove(Number(req.params.id));
  res.status(204).send(); // 204 = No Content (borrado exitoso, sin body)
};
