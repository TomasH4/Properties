# 🧑‍💻 Guía de Tomás — Secciones 2, 4, 6

> **Contexto para IA**: Este es el backend de un Sistema de Gestión de Propiedades (Real Estate).
> Stack: Node.js + Express 5 + TypeScript + Prisma 7 + PostgreSQL (Supabase) + JWT + Zod.
> Tomás es responsable de: base de datos (migraciones/seed), validaciones con Zod, y autenticación JWT.

---

## Sección 2 — Base de Datos y Migraciones

### 🧠 Teoría Profunda

#### ¿Qué es una base de datos relacional?

PostgreSQL es una base de datos **relacional**: los datos se guardan en **tablas** (como hojas de Excel), con **filas** (registros) y **columnas** (campos). Cada tabla tiene una **clave primaria** (un ID único que identifica cada fila).

```
Tabla "properties":
┌────┬──────────────────────┬─────────────┬───────────┬───────────┐
│ id │ title                │ price       │ location  │ available │
├────┼──────────────────────┼─────────────┼───────────┼───────────┤
│ 1  │ Apartamento Poblado  │ 350000000   │ Medellín  │ true      │
│ 2  │ Casa en Envigado     │ 450000000   │ Envigado  │ true      │
└────┴──────────────────────┴─────────────┴───────────┴───────────┘
```

#### ¿Qué es Prisma y cómo se relaciona con SQL?

Prisma es un **ORM** (Object-Relational Mapper). Traduce código TypeScript a SQL:

```typescript
// Tú escribes esto (TypeScript):
await prisma.property.findMany({
  where: { location: "Medellín" }
});

// Prisma genera esto (SQL):
// SELECT * FROM properties WHERE location = 'Medellín';
```

#### ¿Qué son las migraciones y por qué son importantes?

Una migración es un archivo que describe un cambio en la estructura de tu base de datos. Piénsalo como un "historial de cambios" para tu DB:

```
Migración 1 (init): Crear tabla properties con columnas id, title, price, location, available, createdAt
Migración 2: Crear tabla users con columnas id, name, email, password, createdAt
Migración 3: Agregar columna "description" a properties
```

Cada migración genera un archivo SQL que Prisma guarda en `prisma/migrations/`.

**¿Por qué no cambiar la DB a mano?** Porque:
- Tu compañero no sabrá qué cambiaste
- En producción no podrás recrear los cambios
- Las migraciones son reversibles y documentadas

#### ¿Qué es un seed?

Un script que llena la base de datos con datos iniciales de prueba. Así cuando clonas el proyecto o reseteas la DB, tienes datos para trabajar inmediatamente.

### ✅ Paso a Paso

#### Paso 2.1: Verificar el schema.prisma

El schema actual ya tiene los modelos `Property` y `User`. Revísalo y asegúrate de entender cada línea:

```prisma
model Property {
  id        Int      @id @default(autoincrement())  // @id = clave primaria, autoincrement = se genera solo
  title     String                                   // String = texto
  price     Float                                    // Float = número decimal
  location  String
  available Boolean  @default(true)                  // @default = valor si no se especifica
  createdAt DateTime @default(now())                 // now() = fecha/hora actual

  @@map("properties")  // @@map = nombre real de la tabla en PostgreSQL
}
```

**Cada `@` es un "decorador" de Prisma:**
- `@id` → esta columna es la clave primaria
- `@default(value)` → valor por defecto si no se envía
- `@unique` → no puede haber dos filas con el mismo valor
- `@@map("name")` → nombre de la tabla en la DB (sin esto, sería "Property" con P mayúscula)

#### Paso 2.2: Ejecutar la primera migración

```bash
npx prisma migrate dev --name init
```

**¿Qué hace este comando?**
1. Compara tu `schema.prisma` con el estado actual de la DB
2. Genera un archivo SQL con los cambios necesarios
3. Ejecuta ese SQL en tu base de datos
4. Regenera el Prisma Client (el código TypeScript que usas para hacer queries)

Después de ejecutar, verás una nueva carpeta:
```
prisma/
├── migrations/
│   └── 20260505_init/
│       └── migration.sql    ← El SQL que Prisma generó
├── schema.prisma
```

**Abre el archivo `migration.sql`** y léelo. Vas a ver SQL puro:
```sql
CREATE TABLE "properties" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  ...
);
```

Esto es lo que Prisma ejecutó en tu base de datos.

#### Paso 2.3: Crear el seed

Crea el archivo `prisma/seed.ts`:

**Qué debes implementar:**
1. Importar `prisma` desde `../src/db/prisma` y `bcrypt`
2. Crear una función `main()` async que:
   - Hashee una contraseña de admin con `bcrypt.hash("123456", 10)`
     - El `10` es el "salt rounds" (cuántas veces se procesa). Más alto = más seguro pero más lento. 10 es el estándar.
   - Cree un usuario admin con `prisma.user.upsert()`:
     ```typescript
     // upsert = "update or insert"
     // Si ya existe un user con ese email, lo actualiza
     // Si no existe, lo crea
     // Esto evita errores si ejecutas el seed varias veces
     await prisma.user.upsert({
       where: { email: "admin@test.com" },
       update: {},  // Si ya existe, no cambiar nada
       create: {
         name: "Admin",
         email: "admin@test.com",
         password: hashedPassword,
       },
     });
     ```
   - Cree 5 propiedades de ejemplo con `prisma.property.createMany()`:
     ```typescript
     await prisma.property.createMany({
       data: [
         { title: "Apartamento en El Poblado", price: 350000000, location: "Medellín" },
         { title: "Casa en Envigado", price: 450000000, location: "Envigado" },
         { title: "Oficina en Laureles", price: 280000000, location: "Medellín" },
         { title: "Penthouse en Sabaneta", price: 600000000, location: "Sabaneta" },
         { title: "Local Comercial Centro", price: 180000000, location: "Medellín", available: false },
       ],
       skipDuplicates: true,  // Ignora si ya existen
     });
     ```
3. Llamar a `main()` con manejo de errores:
   ```typescript
   main()
     .catch((e) => {
       console.error("Error en seed:", e);
       process.exit(1);
     })
     .finally(async () => {
       await prisma.$disconnect();  // Siempre cerrar la conexión al terminar
     });
   ```

#### Paso 2.4: Configurar el seed en package.json

Agrega esto al `package.json` (al mismo nivel que "scripts", "dependencies", etc.):

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

#### Paso 2.5: Ejecutar el seed

```bash
npx prisma db seed
```

### 🔍 Verificación

```bash
npx prisma studio
```

Esto abre un panel visual en tu navegador. Deberías ver:
- Tabla `properties` con 5 filas
- Tabla `users` con 1 fila (admin@test.com)
- La contraseña del admin debe verse como `$2b$10$...` (hasheada, NO "123456")

---

## Sección 4 — Validación con Zod

### 🧠 Teoría Profunda

#### ¿Qué es Zod?

Zod es una librería que te permite definir **schemas** (reglas de validación) y validar datos contra ellos. Si los datos no cumplen las reglas, Zod te dice exactamente qué está mal.

```typescript
import { z } from "zod";

// Definir un schema
const userSchema = z.object({
  name: z.string().min(2),         // string con mínimo 2 caracteres
  age: z.number().int().positive(), // número entero positivo
  email: z.string().email(),        // string con formato email
});

// Validar datos
const result = userSchema.safeParse({ name: "A", age: -5, email: "no" });

// result.success = false
// result.error.issues = [
//   { path: ["name"], message: "String must contain at least 2 character(s)" },
//   { path: ["age"], message: "Number must be greater than 0" },
//   { path: ["email"], message: "Invalid email" },
// ]
```

#### `parse` vs `safeParse`

```typescript
// parse: LANZA un error si falla (tienes que usar try/catch)
const data = schema.parse(input); // 💥 ZodError si falla

// safeParse: RETORNA un objeto con success/error (más controlado)
const result = schema.safeParse(input);
if (!result.success) {
  // result.error tiene los detalles
} else {
  // result.data tiene los datos validados
}
```

Para el middleware de validación, usa `safeParse` porque necesitas controlar la respuesta de error.

#### ¿Por qué un middleware de validación genérico?

Sin middleware genérico, repetirías la lógica de validación en cada controller:

```typescript
// ❌ Repetitivo
export const create = (req, res) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json(result.error);
  // ...
};
export const update = (req, res) => {
  const result = updateSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json(result.error);
  // ...
};
```

Con un middleware genérico, la validación se hace ANTES del controller:

```typescript
// ✅ Limpio
router.post("/", validate({ body: createSchema }), controller.create);
router.put("/:id", validate({ body: updateSchema, params: idSchema }), controller.update);
```

#### ¿Qué es `z.coerce` y por qué lo necesitas?

Los **query params** y **route params** SIEMPRE llegan como **strings** en Express. Cuando pides `/properties?page=2`, `req.query.page` es `"2"` (string), NO `2` (number).

```typescript
// ❌ Esto SIEMPRE falla con query params
z.number().min(1)  // "2" no es un number, es un string

// ✅ z.coerce convierte antes de validar
z.coerce.number().min(1)  // "2" → 2 → valida min(1) → OK
```

#### ¿Qué es `.partial()`?

Hace que TODAS las propiedades del schema sean opcionales. Perfecto para `PUT` donde puedes actualizar solo algunos campos:

```typescript
const createSchema = z.object({
  title: z.string(),     // requerido
  price: z.number(),     // requerido
});

const updateSchema = createSchema.partial();
// Equivale a:
// z.object({
//   title: z.string().optional(),
//   price: z.number().optional(),
// })
```

### ✅ Paso a Paso

#### Paso 4.1: Crear `src/middlewares/validate.ts`

**Qué debes implementar:**

Una función que recibe un objeto con schemas opcionales y retorna un middleware de Express.

```typescript
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "../errors/AppError";

// El tipo del parámetro: un objeto con schemas opcionales para body, params, query
interface ValidationSchemas {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

// Esta función RETORNA un middleware (es una "factory function")
export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Para cada schema que se pasó, validar la parte correspondiente del request
    // Si alguno falla, lanzar AppError(400) con los mensajes de error
    // Si todos pasan, llamar next()

    // Tip: puedes iterar sobre los schemas así:
    // for (const [key, schema] of Object.entries(schemas)) {
    //   const result = schema.safeParse(req[key]);
    //   ...
    // }
  };
};
```

**Formato del error que debes enviar:**
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "Required" },
    { "field": "price", "message": "Expected number, received string" }
  ]
}
```

**Tip para extraer errores de Zod:**
```typescript
const formatted = zodError.issues.map((issue) => ({
  field: issue.path.join("."),  // ["price"] → "price"
  message: issue.message,
}));
```

#### Paso 4.2: Crear `src/modules/properties/property.schema.ts`

**Qué debes implementar:**

```typescript
import { z } from "zod";

// Schema para crear una propiedad (body del POST)
export const createPropertySchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters"),
  price: z.number()
    .positive("Price must be a positive number"),
  location: z.string()
    .min(2, "Location must be at least 2 characters"),
  available: z.boolean()
    .default(true),  // Si no se envía, es true por defecto
});

// Schema para actualizar (todo es opcional)
export const updatePropertySchema = createPropertySchema.partial();
// .partial() hace que todos los campos sean opcionales
// Así puedes actualizar solo el precio, solo el título, etc.

// Schema para el parámetro :id en la URL
export const propertyIdSchema = z.object({
  id: z.coerce.number()      // Convierte "42" → 42
    .int("ID must be an integer")
    .positive("ID must be positive"),
});

// Schema para query params (filtros + paginación)
export const propertyQuerySchema = z.object({
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// BONUS: Exportar los tipos inferidos para que Luis Carlos los use en el service
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyQuery = z.infer<typeof propertyQuerySchema>;
```

**¿Qué es `z.infer<typeof schema>`?**
Extrae el tipo TypeScript del schema Zod. Así no defines los tipos dos veces:
```typescript
// El schema Zod Y el tipo TypeScript se generan del mismo lugar
const schema = z.object({ title: z.string(), price: z.number() });
type Data = z.infer<typeof schema>;
// Data = { title: string; price: number }
```

#### Paso 4.3: Crear `src/modules/auth/auth.schema.ts`

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string()
    .email("Invalid email format"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### 🔍 Verificación

Los schemas se prueban cuando Luis Carlos integre las rutas con el middleware `validate`. Pero puedes verificar que todo compila:

```bash
npx tsc --noEmit
```

Si no hay errores de TypeScript, tus schemas están correctos.

---

## Sección 6 — Autenticación JWT

### 🧠 Teoría Profunda

#### ¿Cómo funciona JWT paso a paso?

**Paso 1: Login**
```
Cliente → POST /api/v1/auth/login
Body: { "email": "admin@test.com", "password": "123456" }
```

**Paso 2: El servidor verifica**
```typescript
// 1. Buscar usuario por email
const user = await prisma.user.findUnique({ where: { email } });
// user = { id: 1, email: "admin@test.com", password: "$2b$10$xK..." }

// 2. Comparar password con bcrypt
const valid = await bcrypt.compare("123456", "$2b$10$xK...");
// bcrypt.compare hashea "123456" con el mismo salt y compara
// Si coincide → valid = true
```

**Paso 3: Generar token**
```typescript
const token = jwt.sign(
  { userId: user.id, email: user.email },  // payload (datos que van DENTRO del token)
  process.env.JWT_SECRET,                    // secret (clave para firmar)
  { expiresIn: "24h" }                       // opciones
);
// token = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20ifQ.abc123"
//          ^^^^^^^^ HEADER ^^^^^^^^.^^^^^^^^^^^^^^^^ PAYLOAD ^^^^^^^^^^^^^^^^^^^^^^^.SIGNATURE
```

**Paso 4: El cliente guarda el token y lo usa**
```
Cliente → GET /api/v1/properties (ruta protegida)
Header: Authorization: Bearer eyJhbG...
```

**Paso 5: El middleware auth verifica el token**
```typescript
// 1. Extraer token del header
const authHeader = req.headers.authorization;  // "Bearer eyJhbG..."
const token = authHeader.split(" ")[1];         // "eyJhbG..."

// 2. Verificar y decodificar
const payload = jwt.verify(token, process.env.JWT_SECRET);
// Si el token es válido: payload = { userId: 1, email: "admin@test.com", iat: ..., exp: ... }
// Si es inválido o expirado: LANZA un error

// 3. Adjuntar al request para que el controller sepa quién es
req.user = payload;
```

#### ¿Qué contiene un JWT?

Un JWT tiene 3 partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.firma123
│                      │                  │
│                      │                  └─ SIGNATURE: firma digital con tu JWT_SECRET
│                      │                     Si alguien modifica el payload, la firma no coincide
│                      │
│                      └─ PAYLOAD: datos codificados en Base64 (NO encriptados)
│                         Cualquiera puede leerlos. NUNCA pongas contraseñas aquí.
│                         Contiene: userId, email, iat (issued at), exp (expiration)
│
└─ HEADER: algoritmo usado (HS256) codificado en Base64
```

**IMPORTANTE: JWT NO encripta datos, solo los FIRMA.** Cualquiera puede decodificar el payload. La firma solo garantiza que nadie lo modificó.

#### Seguridad: ¿Por qué dar el MISMO mensaje para "email no encontrado" y "contraseña incorrecta"?

```typescript
// ❌ PELIGROSO: le dices al atacante que el email SÍ existe
if (!user) throw new AppError(401, "User not found");
if (!validPassword) throw new AppError(401, "Wrong password");

// ✅ SEGURO: el atacante no sabe si falló el email o la contraseña
if (!user) throw new AppError(401, "Invalid credentials");
if (!validPassword) throw new AppError(401, "Invalid credentials");
```

Si dices "User not found", un atacante puede probar miles de emails hasta encontrar uno que NO dé ese error → ahora sabe que ese email existe y puede concentrar el ataque de contraseña.

### ✅ Paso a Paso

#### Paso 6.1: Crear `src/types/express.d.ts`

Este archivo **extiende** el tipo `Request` de Express para incluir la propiedad `user`:

```typescript
// Este archivo NO se importa en ningún lado
// TypeScript lo detecta automáticamente porque está en la carpeta src/
// y tu tsconfig.json incluye "src/**/*"

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

// Esta línea es necesaria para que TypeScript trate el archivo como un módulo
export {};
```

**¿Qué es `declare global`?** Le dice a TypeScript: "quiero agregar tipos al espacio global, no solo a este archivo". Esto modifica el tipo `Request` de Express en TODOS los archivos del proyecto.

#### Paso 6.2: Crear `src/modules/auth/auth.service.ts`

**Qué debes implementar:**

```typescript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../db/prisma";
import { AppError } from "../../errors/AppError";
import { env } from "../../config/env";
import { LoginInput } from "./auth.schema";

export const login = async ({ email, password }: LoginInput) => {
  // 1. Buscar usuario por email
  const user = await prisma.user.findUnique({ where: { email } });

  // 2. Si no existe → error genérico (NO decir "user not found")
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  // 3. Comparar contraseña con bcrypt
  const isValidPassword = await bcrypt.compare(password, user.password);

  // 4. Si no coincide → MISMO error genérico
  if (!isValidPassword) {
    throw new AppError(401, "Invalid credentials");
  }

  // 5. Generar JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return { token };
};
```

#### Paso 6.3: Crear `src/modules/auth/auth.controller.ts`

```typescript
import { Request, Response } from "express";
import * as authService from "./auth.service";

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json(result);
};
```

#### Paso 6.4: Crear `src/modules/auth/auth.routes.ts`

```typescript
import { Router } from "express";
import * as controller from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { loginSchema } from "./auth.schema";

const router = Router();

router.post("/login", validate({ body: loginSchema }), controller.login);

export default router;
```

#### Paso 6.5: Crear `src/middlewares/auth.ts`

Este es el middleware que protege rutas. Se usa así en las rutas:
```typescript
router.post("/", auth, controller.create);  // Solo usuarios autenticados pueden crear
```

**Qué debes implementar:**

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { env } from "../config/env";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  // 1. Obtener el header Authorization
  const authHeader = req.headers.authorization;

  // 2. Verificar que existe y tiene formato "Bearer TOKEN"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(401, "Access token is required");
  }

  // 3. Extraer el token (quitar "Bearer ")
  const token = authHeader.split(" ")[1];

  // 4. Verificar el token con jwt.verify
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      userId: number;
      email: string;
    };

    // 5. Adjuntar el usuario al request
    req.user = payload;

    // 6. Pasar al siguiente middleware/controller
    next();
  } catch (error) {
    throw new AppError(401, "Invalid or expired token");
  }
};
```

#### Paso 6.6: Integración con Luis Carlos

Dile a Luis Carlos que agregue en `app.ts`:

```typescript
import authRoutes from "./modules/auth/auth.routes";
app.use("/api/v1/auth", authRoutes);
```

Y que actualice `property.routes.ts` para proteger las rutas:

```typescript
import { auth } from "../../middlewares/auth";

router.post("/", auth, validate({ body: createPropertySchema }), controller.create);
router.put("/:id", auth, validate({ params: propertyIdSchema, body: updatePropertySchema }), controller.update);
router.delete("/:id", auth, validate({ params: propertyIdSchema }), controller.remove);
```

### 🔍 Verificación

```bash
# 1. Login con credenciales correctas
POST http://localhost:3000/api/v1/auth/login
Body: { "email": "admin@test.com", "password": "123456" }
# Debe retornar: { "token": "eyJ..." }

# 2. Login con email incorrecto
Body: { "email": "noexiste@test.com", "password": "123456" }
# Debe retornar: 401 { "message": "Invalid credentials" }

# 3. Login con password incorrecto
Body: { "email": "admin@test.com", "password": "wrongpassword" }
# Debe retornar: 401 { "message": "Invalid credentials" }

# 4. Crear propiedad SIN token
POST http://localhost:3000/api/v1/properties
# Debe retornar: 401 { "message": "Access token is required" }

# 5. Crear propiedad CON token
POST http://localhost:3000/api/v1/properties
Header: Authorization: Bearer [pega el token del paso 1]
Body: { "title": "Nueva Casa", "price": 300000000, "location": "Medellín" }
# Debe retornar: 201 con la propiedad creada

# 6. Usar un token inventado
Header: Authorization: Bearer token_falso_123
# Debe retornar: 401 { "message": "Invalid or expired token" }
```

---

## ⏭️ Después de terminar tus secciones

1. **Reunirse con Luis Carlos** para integrar:
   - Él registra `authRoutes` en `app.ts`
   - Él aplica `auth` y `validate` en `property.routes.ts`
2. **Probar el flujo completo juntos**
3. **Asegurarse de que ambos entienden TODO** — en la sustentación preguntan a cualquiera
4. **Preparar preguntas de sustentación:**
   - ¿Cómo funciona JWT internamente?
   - ¿Por qué usamos bcrypt y no SHA256?
   - ¿Qué hace `z.coerce`?
   - ¿Qué pasa si el token expira?
   - ¿Por qué el mismo mensaje para email y password incorrectos?
