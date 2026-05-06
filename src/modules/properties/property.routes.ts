// ===== PASO 6.6 (apoyo Luis Carlos): Rutas de propiedades =====
import { Router } from "express";
import * as controller from "./property.controller";
import { validate } from "../../middlewares/validate";
import { auth } from "../../middlewares/auth";
import {
  createPropertySchema,
  updatePropertySchema,
  propertyIdSchema,
  propertyQuerySchema,
} from "./property.schema";

const router = Router();

// Rutas PÚBLICAS (no requieren token)
router.get("/", validate({ query: propertyQuerySchema }), controller.getAll);
router.get("/:id", validate({ params: propertyIdSchema }), controller.getById);

// Rutas PROTEGIDAS (requieren token JWT en Authorization: Bearer <token>)
router.post("/", auth, validate({ body: createPropertySchema }), controller.create);
router.put("/:id", auth, validate({ params: propertyIdSchema, body: updatePropertySchema }), controller.update);
router.delete("/:id", auth, validate({ params: propertyIdSchema }), controller.remove);

export default router;
