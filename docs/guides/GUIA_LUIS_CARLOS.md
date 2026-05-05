# 🧑‍💻 Guía de Luis Carlos — Secciones 1, 3, 5, 7

> **Contexto para IA**: Este es el backend de un Sistema de Gestión de Propiedades (Real Estate).
> Stack: Node.js + Express 5 + TypeScript + Prisma 7 + PostgreSQL (Supabase) + JWT + Zod.
> Luis Carlos es responsable de: arquitectura, manejo de errores, CRUD de propiedades, y seguridad.

---

## Sección 1 — Arquitectura y Estructura de Carpetas

### 🧠 Teoría Profunda

#### ¿Qué es Express y cómo funciona internamente?

Express es una librería que envuelve el módulo `http` nativo de Node.js. Cuando escribes:

```typescript
const app = express();
app.listen(3000);
```

Internamente, Express hace esto:

```typescript
// Esto es lo que Express hace por ti (simplificado)
const http = require("http");
const server = http.createServer((req, res) => {
  // Express procesa la petición aquí
});
server.listen(3000);
```

Express agrega un sistema de **middlewares** y **rutas** encima de este servidor HTTP básico.

#### ¿Qué es un middleware exactamente?

Un middleware es una función con esta firma:

```typescript
function miMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. Puedes LEER el request
  console.log(req.method, req.url);

  // 2. Puedes MODIFICAR el request
  req.user = { id: 1 };

  // 3. Puedes RESPONDER directamente (y cortar la cadena)
  // res.status(403).json({ error: "Prohibido" });

  // 4. O puedes PASAR al siguiente middleware
  next();
}
```

Los middlewares se ejecutan en el **ORDEN en que los registras**. Esto es CRUCIAL:

```typescript
// ❌ MAL: la ruta se ejecuta ANTES del middleware de seguridad
app.use("/api", routes);
app.use(helmet());

// ✅ BIEN: helmet se ejecuta PRIMERO, ANTES de las rutas
app.use(helmet());
app.use("/api", routes);
```

#### ¿Por qué separar `app.ts` de `index.ts`?

```
index.ts = ARRANQUE del proceso (app.listen)
app.ts   = CONFIGURACIÓN de Express (middlewares + rutas)
```

Razón principal: **testabilidad**. Si quieres hacer tests automáticos, necesitas importar `app` SIN que el servidor arranque. Si todo está en `index.ts`, cada test arrancaría un servidor en un puerto y tendrías conflictos.

```typescript
// En un test futuro podrías hacer:
import app from "./app";
import request from "supertest";

test("GET /api/v1/properties retorna 200", async () => {
  const res = await request(app).get("/api/v1/properties");
  expect(res.status).toBe(200);
});
// Nota: esto NO arranca un servidor — supertest lo maneja internamente
```

#### ¿Qué son las variables de entorno y por qué validarlas?

Las variables de entorno son valores que **cambian según dónde se ejecuta la app**:
- En tu PC: `DATABASE_URL` apunta a Supabase de desarrollo
- En producción: `DATABASE_URL` apuntaría a otro servidor

El archivo `.env` guarda estos valores. `dotenv.config()` los carga en `process.env`.

**¿Por qué validar con Zod?** Porque si arrancas la app sin `JWT_SECRET`, todo parece funcionar hasta que alguien intenta hacer login y BOOM — error críptico. Es mejor fallar inmediatamente al arrancar con un mensaje claro: *"JWT_SECRET is required"*.

### ✅ Paso a Paso

#### Paso 1.1: Crear las carpetas

Crea esta estructura (los archivos pueden estar vacíos por ahora):

```
src/
├── config/
│   └── env.ts
├── errors/
│   └── AppError.ts
├── middlewares/
│   ├── errorHandler.ts
│   ├── auth.ts          ← vacío (lo hace Tomás en Sección 6)
│   └── validate.ts      ← vacío (lo hace Tomás en Sección 4)
├── modules/
│   ├── properties/
│   │   ├── property.routes.ts
│   │   ├── property.controller.ts
│   │   ├── property.service.ts
│   │   └── property.schema.ts   ← vacío (lo hace Tomás en Sección 4)
│   └── auth/
│       ├── auth.routes.ts        ← vacío (lo hace Tomás en Sección 6)
│       ├── auth.controller.ts    ← vacío (lo hace Tomás en Sección 6)
│       ├── auth.service.ts       ← vacío (lo hace Tomás en Sección 6)
│       └── auth.schema.ts        ← vacío (lo hace Tomás en Sección 4)
├── types/
│   └── express.d.ts              ← vacío (lo hace Tomás en Sección 6)
├── db/
│   └── prisma.ts                 ← ya existe
├── app.ts
└── index.ts                      ← ya existe, lo vamos a modificar
```

#### Paso 1.2: Crear `src/config/env.ts`

Este archivo carga y valida las variables de entorno. Si alguna falta, la app NO arranca.

**Qué debes implementar:**
1. Importar `z` de Zod y `dotenv`
2. Llamar `dotenv.config()` al inicio
3. Crear un schema Zod que defina:
   - `DATABASE_URL`: string, debe empezar con `postgresql://`
   - `JWT_SECRET`: string, mínimo 10 caracteres
   - `PORT`: convertir a número con `z.coerce.number()`, default `3000`
4. Parsear `process.env` con el schema
5. Si falla, hacer `console.error` con los errores y `process.exit(1)` (cerrar la app)
6. Exportar el objeto validado como `env`

**Ejemplo de uso después:**
```typescript
import { env } from "./config/env";
console.log(env.PORT); // 3000 (ya es number, no string)
console.log(env.JWT_SECRET); // tu secret validado
```

**Concepto clave - `z.coerce`:**
Las variables de entorno SIEMPRE son strings (`process.env.PORT` es `"3000"`, no `3000`). `z.coerce.number()` convierte automáticamente el string a número.

#### Paso 1.3: Crear `src/app.ts`

**Qué debes implementar:**
1. Importar `express`, `cors`
2. Crear `const app = express()`
3. Registrar middlewares globales EN ESTE ORDEN:
   - `app.use(cors())`
   - `app.use(express.json())`
4. Crear una ruta de salud: `GET /` que responda `{ status: "ok", message: "API de Propiedades v1" }`
5. (Después agregarás las rutas y el errorHandler, pero por ahora déjalo así)
6. `export default app`

#### Paso 1.4: Modificar `src/index.ts`

**Qué debes implementar:**
1. Importar `app` desde `./app`
2. Importar `env` desde `./config/env`
3. Usar `env.PORT` en lugar de `process.env.PORT`
4. Eliminar toda la configuración de Express que ya moviste a `app.ts`
5. Solo debe quedar el `app.listen()`

**El archivo final debe verse así (aprox 8-10 líneas):**
```typescript
import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
});
```

### 🔍 Verificación

1. Ejecuta `npm run dev`
2. Si falta alguna variable en `.env`, deberías ver un error claro de Zod
3. Si todo está bien, deberías ver "Servidor corriendo en http://localhost:3000"
4. Abre el navegador en `http://localhost:3000` → deberías ver `{ status: "ok", ... }`

---

## Sección 3 — Manejo Centralizado de Errores

### 🧠 Teoría Profunda

#### ¿Qué pasa cuando un error NO se maneja?

```typescript
app.get("/api/v1/properties/:id", async (req, res) => {
  const property = await prisma.property.findUnique({ where: { id: 999 } });
  // property es null, pero intentamos acceder a .title
  res.json({ title: property.title }); // 💥 TypeError: Cannot read property 'title' of null
});
```

Sin manejo de errores:
1. Express muestra un stack trace HTML al cliente (fuga de información)
2. El cliente recibe un 500 genérico sin saber qué pasó
3. Tú no tienes log de qué falló

#### ¿Qué es un "error operacional" vs un "error de programación"?

| Tipo | Ejemplo | ¿Es un bug? | ¿Qué hacer? |
|------|---------|-------------|-------------|
| **Operacional** | "Propiedad no encontrada", "Token inválido", "Body inválido" | No | Responder con código HTTP apropiado |
| **Programación** | `TypeError`, `ReferenceError`, variable undefined | Sí | Loguear, responder 500, arreglar el bug |

Tu clase `AppError` marca los errores que TÚ lanzas intencionalmente como "operacionales". Los demás son bugs.

#### ¿Por qué el error handler es el ÚLTIMO middleware?

Express tiene una regla especial: si un middleware tiene **4 parámetros** `(err, req, res, next)`, es un **middleware de error**. Solo se ejecuta cuando:
- Un middleware anterior llama `next(error)`
- Un `throw` ocurre dentro de un middleware async (Express 5 lo maneja automáticamente)

```typescript
// Middleware normal (3 params)
app.use((req, res, next) => { ... });

// Middleware de ERROR (4 params) — Express lo detecta por la firma
app.use((err, req, res, next) => { ... });
```

**Express 5 vs Express 4**: En Express 4, si hacías `throw` dentro de un `async` handler, el error NO llegaba al error handler (tenías que usar `next(error)`). En Express 5 (que tú usas), los `throw` en funciones async SÍ se capturan automáticamente. Esto simplifica mucho tu código.

### ✅ Paso a Paso

#### Paso 3.1: Crear `src/errors/AppError.ts`

**Qué debes implementar:**

```typescript
// AppError extiende la clase nativa Error de JavaScript
// ¿Qué hereda de Error? La propiedad "message" y el "stack trace"
// ¿Qué agrega? statusCode e isOperational

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);  // Llama al constructor de Error y le pasa el message
    this.statusCode = statusCode;
    this.isOperational = true;  // Todos los AppError son operacionales

    // Esto arregla un problema de herencia en TypeScript:
    // Sin esta línea, "instanceof AppError" podría fallar
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
```

**¿Qué es `readonly`?** Significa que la propiedad se asigna UNA vez (en el constructor) y después no se puede cambiar. Es una protección extra.

**¿Qué es `Object.setPrototypeOf`?** Cuando extiendes clases nativas como `Error` en TypeScript, la cadena de prototipos puede romperse. Esta línea asegura que `err instanceof AppError` funcione correctamente.

#### Paso 3.2: Crear `src/middlewares/errorHandler.ts`

**Qué debes implementar:**

Un middleware con 4 parámetros que:
1. Verifica si `err` es instancia de `AppError`
2. Si sí → responde con el `statusCode` y `message` del error
3. Si no → es un bug inesperado, responde 500 con mensaje genérico
4. SIEMPRE loguea el error completo en consola (para debugging)
5. NUNCA envía el stack trace al cliente (fuga de seguridad)

**Formato de respuesta:**
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Property not found"
}
```

**Para errores inesperados (no AppError):**
```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Internal server error"
}
```

**Tip importante:** El tipo de Express para error handlers es:
```typescript
import { Request, Response, NextFunction } from "express";

// Nota: el primer parámetro es el error
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // ...
};
```

#### Paso 3.3: Registrar en `app.ts`

Agrega el error handler como el **ÚLTIMO** `app.use()` en `app.ts`, después de todas las rutas.

```typescript
// ... todas tus rutas arriba ...

// ÚLTIMO middleware: atrapa cualquier error que haya ocurrido
app.use(errorHandler);
```

#### Paso 3.4: Crear ruta de prueba

Agrega temporalmente en `app.ts`:

```typescript
app.get("/api/v1/test-error", (_req, _res) => {
  throw new AppError(418, "I'm a teapot");
});
```

### 🔍 Verificación

1. `GET http://localhost:3000/api/v1/test-error` → debe retornar status 418 con `{ "status": "error", "statusCode": 418, "message": "I'm a teapot" }`
2. En la consola del servidor debe aparecer el error logueado
3. Elimina la ruta de prueba después de verificar

---

## Sección 5 — CRUD de Propiedades + Filtros + Paginación

### 🧠 Teoría Profunda

#### El patrón Route → Controller → Service

```
┌──────────────┐    ┌────────────────┐    ┌─────────────────┐    ┌─────────┐
│    Route      │───▶│   Controller   │───▶│    Service       │───▶│ Prisma  │
│ Define URLs   │    │ Parsea req/res │    │ Lógica negocio  │    │  (DB)   │
│ Aplica midlw  │    │ NO lógica      │    │ NO conoce HTTP  │    │         │
└──────────────┘    └────────────────┘    └─────────────────┘    └─────────┘
```

**¿Por qué separar controller de service?**

El service NO debe saber nada de HTTP (no recibe `req` ni `res`). Solo recibe datos puros y retorna datos puros. Esto permite:
- Reusar el service desde otro contexto (ej: un comando CLI, un cron job)
- Testar la lógica sin simular peticiones HTTP

```typescript
// ❌ MAL: el service conoce HTTP
function createProperty(req: Request, res: Response) {
  const property = await prisma.property.create({ data: req.body });
  res.status(201).json(property);
}

// ✅ BIEN: el controller maneja HTTP, el service solo datos
// Controller:
function create(req: Request, res: Response) {
  const property = await propertyService.create(req.body);
  res.status(201).json(property);
}
// Service:
function create(data: CreatePropertyData) {
  return prisma.property.create({ data });
}
```

#### ¿Cómo funciona la paginación?

Imagina que tienes 50 propiedades y el cliente quiere verlas de 5 en 5:

```
Página 1: propiedades 1-5   → skip: 0,  take: 5
Página 2: propiedades 6-10  → skip: 5,  take: 5
Página 3: propiedades 11-15 → skip: 10, take: 5

Fórmula: skip = (page - 1) * limit
         take = limit
```

En Prisma:
```typescript
const properties = await prisma.property.findMany({
  skip: (page - 1) * limit,
  take: limit,
});
```

#### ¿Cómo funcionan los filtros dinámicos?

Los filtros llegan por query params. NO todos estarán presentes. Debes construir el `where` dinámicamente:

```typescript
// Si el cliente manda: ?location=Medellin&minPrice=100000000
// req.query = { location: "Medellin", minPrice: "100000000" }
// (Después de validar con Zod, minPrice ya es number)

// Construyes el where SOLO con los filtros que llegaron:
const where: any = {};

if (filters.location) {
  where.location = {
    contains: filters.location,  // Busca "Medellin" dentro del campo
    mode: "insensitive"          // No distingue mayúsculas/minúsculas
  };
}

if (filters.minPrice !== undefined) {
  where.price = { gte: filters.minPrice }; // gte = greater than or equal (>=)
}

if (filters.maxPrice !== undefined) {
  where.price = { ...where.price, lte: filters.maxPrice }; // lte = less than or equal (<=)
}
```

**¿Qué es `...where.price`?** Es el spread operator. Si ya asignaste `where.price = { gte: 100 }` y ahora quieres agregar `lte: 500`, necesitas MANTENER el gte. El spread copia lo que ya existe: `{ ...{ gte: 100 }, lte: 500 }` → `{ gte: 100, lte: 500 }`.

### ✅ Paso a Paso

#### Paso 5.1: Crear `src/modules/properties/property.service.ts`

**Qué debes implementar:**

5 funciones que hablan con Prisma. Cada una recibe datos puros y retorna datos puros.

1. **`findAll(filters)`** — La más compleja
   - Recibe: `{ location?, minPrice?, maxPrice?, page, limit }`
   - Construye el `where` dinámicamente (como se mostró arriba)
   - Ejecuta DOS queries en paralelo con `Promise.all`:
     - `prisma.property.findMany({ where, skip, take, orderBy: { createdAt: "desc" } })`
     - `prisma.property.count({ where })` ← para saber el total de resultados
   - Retorna: `{ data, total, page, limit }`

2. **`findById(id)`**
   - `prisma.property.findUnique({ where: { id } })`
   - Si no existe → `throw new AppError(404, "Property not found")`

3. **`create(data)`**
   - `prisma.property.create({ data })`

4. **`update(id, data)`**
   - Primero verifica que exista (puedes usar `findById`)
   - `prisma.property.update({ where: { id }, data })`

5. **`remove(id)`**
   - Primero verifica que exista
   - `prisma.property.delete({ where: { id } })`

**¿Qué es `Promise.all`?** Ejecuta varias operaciones async EN PARALELO en vez de una después de otra:
```typescript
// ❌ Secuencial: espera la primera, luego la segunda (~200ms total)
const data = await prisma.property.findMany({ ... });
const total = await prisma.property.count({ ... });

// ✅ Paralelo: ambas al mismo tiempo (~100ms total)
const [data, total] = await Promise.all([
  prisma.property.findMany({ ... }),
  prisma.property.count({ ... }),
]);
```

#### Paso 5.2: Crear `src/modules/properties/property.controller.ts`

**Qué debes implementar:**

5 funciones handler. Cada una: extrae datos del `req`, llama al service, envía respuesta.

```typescript
// Ejemplo de estructura del controller:
import { Request, Response } from "express";
import * as propertyService from "./property.service";

export const getAll = async (req: Request, res: Response) => {
  // req.query ya está validado por el middleware validate (Tomás lo hace)
  const filters = req.query;
  const result = await propertyService.findAll(filters);
  res.json(result);
};

export const getById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const property = await propertyService.findById(id);
  res.json(property);
};

export const create = async (req: Request, res: Response) => {
  const property = await propertyService.create(req.body);
  res.status(201).json(property);  // 201 = Created
};

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const property = await propertyService.update(id, req.body);
  res.json(property);
};

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await propertyService.remove(id);
  res.status(204).send();  // 204 = No Content (borrado exitoso, sin body)
};
```

**¿Por qué `204` para DELETE?** El código `204 No Content` significa "operación exitosa, pero no tengo nada que devolverte". Es el estándar para respuestas de eliminación.

#### Paso 5.3: Crear `src/modules/properties/property.routes.ts`

**Qué debes implementar:**

```typescript
import { Router } from "express";
import * as controller from "./property.controller";
// Cuando Tomás termine, importarás validate y los schemas

const router = Router();

// Rutas públicas (no requieren auth)
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Rutas protegidas (requieren auth)
// Por ahora sin middleware auth — lo agregas cuando Tomás termine la Sección 6
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
```

#### Paso 5.4: Registrar las rutas en `app.ts`

```typescript
import propertyRoutes from "./modules/properties/property.routes";

// Después de los middlewares globales:
app.use("/api/v1/properties", propertyRoutes);

// Antes del errorHandler:
app.use(errorHandler);
```

**¿Qué hace `app.use("/api/v1/properties", propertyRoutes)`?**
Le dice a Express: "toda petición que empiece con `/api/v1/properties` la maneja este router". Dentro del router, `/` es relativo. Es decir:
- `router.get("/")` responde a `GET /api/v1/properties`
- `router.get("/:id")` responde a `GET /api/v1/properties/42`

### 🔍 Verificación

Prueba cada endpoint con Postman o curl. Para esta sección NO necesitas token (lo agregas cuando Tomás termine):

```
GET    http://localhost:3000/api/v1/properties          → Lista vacía o con seeds
GET    http://localhost:3000/api/v1/properties?page=1&limit=2 → Paginación
GET    http://localhost:3000/api/v1/properties/1         → Una propiedad
GET    http://localhost:3000/api/v1/properties/99999     → 404
POST   http://localhost:3000/api/v1/properties           → Crear (body JSON)
PUT    http://localhost:3000/api/v1/properties/1          → Actualizar
DELETE http://localhost:3000/api/v1/properties/1          → Eliminar → 204
```

---

## Sección 7 — Seguridad y Hardening

### 🧠 Teoría Profunda

#### ¿Qué es `helmet` y por qué lo necesitas?

Cada respuesta HTTP lleva **headers**. Algunos headers le dicen al navegador cómo comportarse. Sin configurar, tu API envía headers que dejan vulnerabilidades abiertas:

| Header | Sin helmet | Con helmet | Protege contra |
|--------|-----------|------------|----------------|
| `X-Content-Type-Options` | ausente | `nosniff` | El navegador no "adivina" el tipo de archivo |
| `X-Frame-Options` | ausente | `SAMEORIGIN` | Clickjacking (tu página incrustada en otra) |
| `X-Powered-By` | `Express` | eliminado | Oculta que usas Express (menos info para atacantes) |

#### ¿Qué es Rate Limiting?

Sin rate limiting, un atacante puede:
- Intentar miles de contraseñas por segundo en `/auth/login` (brute force)
- Hacer millones de peticiones y tumbar tu servidor (DoS)

Rate limiting dice: "máximo X peticiones por IP cada Y minutos".

### ✅ Paso a Paso

#### Paso 7.1: Instalar dependencias

```bash
npm install helmet express-rate-limit
npm install -D @types/express-rate-limit
```

#### Paso 7.2: Configurar en `app.ts`

1. **Helmet** — agregar como PRIMER middleware (antes de cors):
   ```typescript
   import helmet from "helmet";
   app.use(helmet());
   ```

2. **Rate Limiter global** — después de helmet:
   ```typescript
   import rateLimit from "express-rate-limit";

   const globalLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,  // 15 minutos
     max: 100,                   // máximo 100 peticiones por IP
     message: { status: "error", message: "Too many requests, try again later" },
   });
   app.use(globalLimiter);
   ```

3. **Rate Limiter estricto para login** — en las rutas de auth:
   ```typescript
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5,  // Solo 5 intentos de login cada 15 min
     message: { status: "error", message: "Too many login attempts, try again later" },
   });
   // Aplícalo SOLO a la ruta de login
   app.use("/api/v1/auth", authLimiter);
   ```

#### Paso 7.3: Configurar CORS correctamente

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? "https://tudominio.com"  // En producción: solo tu frontend
    : "*",                      // En desarrollo: cualquier origen
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

#### Paso 7.4: Generar un JWT_SECRET seguro

En tu terminal ejecuta:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copia el resultado y reemplaza tu `JWT_SECRET` en `.env`.

### 🔍 Verificación

1. Haz 6 peticiones rápidas a `POST /api/v1/auth/login` → la 6ta debe retornar `429`
2. Revisa los headers de respuesta en Postman → deberías ver `x-content-type-options: nosniff`
3. NO deberías ver `X-Powered-By: Express` en los headers

---

## ⏭️ Después de terminar tus secciones

1. **Integrar con el trabajo de Tomás:**
   - Importar el middleware `auth` en `property.routes.ts` y aplicarlo en POST, PUT, DELETE
   - Importar el middleware `validate` y los schemas de Zod en las rutas
   - Importar las rutas de auth en `app.ts`

2. **Probar el flujo completo:**
   - Login → obtener token → crear propiedad con token → verificar que sin token da 401

3. **Escribir el README** con: setup, endpoints, cómo obtener token, ejemplos, decisiones técnicas
