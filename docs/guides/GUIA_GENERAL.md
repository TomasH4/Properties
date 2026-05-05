# 🏗️ Guía General — Sistema de Gestión de Propiedades

## Contexto para IA

> Si estás dando esta guía como contexto a una IA, incluye también:
> - El archivo `package.json` del proyecto
> - El archivo `prisma/schema.prisma`
> - El archivo específico donde tienes el error
> - El mensaje de error completo

---

## 📖 Glosario Completo

### Conceptos de Red y HTTP

| Término | Qué es | Analogía |
|---------|--------|----------|
| **API** | Application Programming Interface. Un contrato que define cómo dos programas se comunican entre sí. Tu API recibe peticiones HTTP y responde con JSON. | Un menú de restaurante: el cliente pide del menú, la cocina prepara lo que pidió. |
| **REST** | Representational State Transfer. Estilo de diseño para APIs basado en: usar verbos HTTP (GET, POST...), URLs que representan recursos (`/properties`), y respuestas en JSON. | Las reglas de etiqueta: cómo pedir, cómo devolver, cómo preguntar. |
| **HTTP** | HyperText Transfer Protocol. El protocolo (conjunto de reglas) que define cómo se envían datos entre un cliente y un servidor en la web. | El idioma que hablan el cliente y el servidor. |
| **Request (req)** | La petición que el cliente envía al servidor. Tiene 4 partes: URL (a dónde), método (qué acción), headers (metadatos), body (datos). | Tu orden completa en un restaurante. |
| **Response (res)** | La respuesta del servidor. Tiene: status code (resultado), headers (metadatos), body (datos de respuesta). | El plato que te traen + la cuenta. |
| **Endpoint** | Una combinación de verbo HTTP + URL que hace algo específico. `GET /api/v1/properties` es un endpoint. `POST /api/v1/properties` es OTRO endpoint (misma URL, distinto verbo). | Un plato específico del menú. |
| **Verbo HTTP** | La acción: `GET` = leer, `POST` = crear, `PUT` = reemplazar/actualizar, `DELETE` = borrar, `PATCH` = actualizar parcialmente. | Leer menú, ordenar, cambiar orden, cancelar. |
| **Status Code** | Número de 3 dígitos que indica qué pasó. `2xx` = éxito, `4xx` = error del cliente, `5xx` = error del servidor. Los más comunes: `200` OK, `201` creado, `400` datos inválidos, `401` no autorizado, `404` no encontrado, `500` error interno. | "Aquí está su plato" (200) vs "Ese plato no existe" (404) vs "La cocina explotó" (500). |
| **Header** | Metadatos que viajan con la petición/respuesta. Como un sobre de carta: la carta es el body, pero el sobre tiene remitente, destinatario, sellos. Ejemplo: `Content-Type: application/json` dice "mis datos vienen en formato JSON". | Instrucciones especiales en la orden. |
| **Body** | El contenido principal de la petición. En `POST` y `PUT`, es el JSON con los datos. En `GET` y `DELETE`, generalmente no hay body. | Los ingredientes de tu pedido. |
| **Query Params** | Parámetros opcionales en la URL después del `?`. Formato: `?clave=valor&clave2=valor2`. Se usan para filtrar, paginar, buscar. Siempre llegan como **strings**. | "Dame la lista, pero filtrada por precio bajo". |
| **Route Params** | Valores dentro de la URL misma, marcados con `:`. En `/properties/:id`, si accedes a `/properties/42`, entonces `id = "42"` (string). | "Dame específicamente el plato número 42". |
| **JSON** | JavaScript Object Notation. Formato de texto para representar datos estructurados: `{ "nombre": "Casa", "precio": 100 }`. Es el idioma universal de las APIs. | Un formulario estandarizado que todos entienden. |

### Conceptos de Backend

| Término | Qué es | Analogía |
|---------|--------|----------|
| **Servidor** | Un programa que escucha en un puerto y responde peticiones. `app.listen(3000)` le dice a Express: "escucha en el puerto 3000". | La cocina del restaurante: siempre abierta esperando órdenes. |
| **Puerto** | Un número (0-65535) que identifica tu aplicación en la computadora. Varias apps pueden correr simultáneamente en distintos puertos. `localhost:3000` = tu máquina, puerto 3000. | El número de ventanilla en un banco. |
| **Express** | Un framework (herramienta) para Node.js que facilita crear servidores HTTP. Te da el sistema de rutas, middlewares, y manejo de request/response. | El equipo completo de cocina: estufas, hornos, utensilios. Sin él, cocinarías en una fogata. |
| **Middleware** | Una función que se ejecuta ENTRE que llega la petición y tu código final la procesa. Recibe `(req, res, next)`. Puede: modificar el request, validar datos, bloquear la petición, o pasar al siguiente middleware con `next()`. Se ejecutan EN ORDEN. | Guardias de seguridad en serie: primero revisan tu identificación, luego tu bolso, luego te dejan pasar. |
| **`next()`** | Función que llamas dentro de un middleware para decir "ya terminé, pasa al siguiente". Si NO llamas `next()`, la petición se queda colgada. Si llamas `next(error)`, salta al middleware de errores. | Decirle al siguiente guardia "ya lo revisé, es tu turno". |
| **Router** | Un mini-app de Express que agrupa rutas relacionadas. `Router()` crea uno. Lo "montas" en la app principal con `app.use("/ruta", router)`. | Una sección del menú: "Entradas", "Platos fuertes", "Postres". |
| **Controller** | Función que recibe `(req, res)`, extrae datos del request, llama al service, y envía la respuesta. **NO** contiene lógica de negocio. | El mesero: recibe la orden, la lleva a la cocina, trae el resultado. |
| **Service** | Función que contiene la LÓGICA DE NEGOCIO. Aquí decides: ¿existe este recurso?, ¿tiene permiso?, ¿qué datos devuelvo? Habla con la base de datos a través de Prisma. | El chef: decide cómo preparar el plato según las reglas de la casa. |
| **ORM** | Object-Relational Mapping. Herramienta que traduce entre objetos de tu código y tablas de la base de datos. Con Prisma escribes `prisma.property.findMany()` en vez de `SELECT * FROM properties`. | Un traductor entre TypeScript y SQL. |
| **Migración** | Un archivo SQL generado por Prisma que describe un cambio en la estructura de tu DB (crear tabla, agregar columna, etc). Se aplican en orden cronológico. | Un plano de remodelación numerado: "Reforma #1: agregar baño. Reforma #2: ampliar cocina." |
| **Seed** | Script que llena la DB con datos iniciales de prueba. Se ejecuta con `npx prisma db seed`. | Surtir el restaurante con ingredientes antes de abrir. |
| **CRUD** | Create, Read, Update, Delete. Las 4 operaciones básicas sobre cualquier recurso. En HTTP: `POST` = Create, `GET` = Read, `PUT` = Update, `DELETE` = Delete. | Las 4 cosas que puedes hacer con un archivo: crearlo, leerlo, editarlo, borrarlo. |

### Conceptos de Seguridad

| Término | Qué es | Analogía |
|---------|--------|----------|
| **JWT** | JSON Web Token. Un string con 3 partes separadas por puntos: `header.payload.signature`. El header dice el algoritmo, el payload contiene datos (userId, email), y la signature es una firma digital usando tu JWT_SECRET. | Un pasaporte: tiene tus datos (payload), un sello oficial (signature), y un formato estándar (header). |
| **Hash** | Función que transforma texto en un string fijo irreversible. `"123456"` → `"$2b$10$xK..."`. NO se puede revertir (no puedes obtener "123456" del hash). | Pasar carne por una picadora: puedes picarla, pero no "des-picarla". |
| **bcrypt** | Algoritmo de hash diseñado para contraseñas. Es deliberadamente LENTO (~100ms por hash) para que los ataques de fuerza bruta sean inviables. Además, agrega un "salt" automáticamente. | Una picadora premium que tarda a propósito para protegerte. |
| **Salt** | Valor aleatorio que se agrega a la contraseña ANTES de hashearla. Resultado: dos usuarios con password "123456" tendrán hashes DIFERENTES. bcrypt lo maneja automáticamente. | Agregar una especia aleatoria a cada plato para que nunca sean idénticos. |
| **Rate Limiting** | Limitar cuántas peticiones puede hacer una IP en un período de tiempo. Ej: máximo 5 intentos de login cada 15 min. Previene ataques de fuerza bruta. | "Máximo 3 intentos para abrir la puerta, después espera 15 minutos." |

### Conceptos de TypeScript

| Término | Qué es | Analogía |
|---------|--------|----------|
| **Tipo (Type)** | Define la forma de tus datos. `price: number` significa que price SOLO puede ser número. TypeScript te avisa en tiempo de desarrollo si le pasas un string. | Etiqueta de un frasco: "solo azúcar" evita meter sal. |
| **Interface** | Un contrato que define qué propiedades debe tener un objeto y de qué tipo son. | Un formulario con campos obligatorios y sus tipos. |
| **async/await** | Sintaxis para operaciones que toman tiempo (consultas a DB, llamadas a APIs). `await` pausa la ejecución hasta que la operación termine. Sin `await`, el código sigue sin esperar el resultado. | Hacer una orden y ESPERAR a que esté lista. Sin await: pides y te vas sin la comida. |
| **try/catch** | Estructura para manejar errores. El código en `try` se ejecuta; si falla, `catch` atrapa el error y tú decides qué hacer. Sin try/catch, un error crashea toda tu aplicación. | Trapecista con red de seguridad. |
| **export/import** | `export` publica una función/variable para que otros archivos la usen. `import` la trae. En Node.js hay dos sistemas: CommonJS (`require`/`module.exports`) y ES Modules (`import`/`export`). Tu proyecto usa CommonJS. | Publicar un libro (export) vs comprarlo en la librería (import). |
| **Genérico (`<T>`)** | Un "comodín de tipo" que se define cuando usas la función, no cuando la creas. `Array<number>` = array de números, `Array<string>` = array de strings. | Un molde de galletas que funciona con cualquier masa. |

---

## 🔗 Cómo se Conectan las Partes

### Flujo completo de una petición

```
CLIENTE (Postman/Frontend)
    │
    │  HTTP Request: POST /api/v1/properties
    │  Header: Authorization: Bearer eyJ...
    │  Body: { "title": "Casa", "price": 500000000, "location": "Medellín" }
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ src/index.ts                                                │
│   Arranca el servidor con app.listen(PORT)                  │
│   Importa app desde app.ts                                  │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ src/app.ts                      (LUIS CARLOS - Sección 1)   │
│   1. helmet()          → Headers de seguridad               │
│   2. cors()            → Permisos de origen                 │
│   3. express.json()    → Parsea body JSON                   │
│   4. rateLimiter()     → Limita peticiones por IP           │
│   5. Rutas montadas:                                        │
│      app.use("/api/v1/auth", authRoutes)                    │
│      app.use("/api/v1/properties", propertyRoutes)          │
│   6. errorHandler()   → Atrapa errores al final             │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ src/modules/properties/property.routes.ts                   │
│                                     (LUIS CARLOS - Secc 5)  │
│                                                             │
│   router.post("/",                                          │
│     auth,              ← middleware auth (TOMÁS - Secc 6)   │
│     validate(schema),  ← middleware validación (TOMÁS - S4) │
│     controller.create  ← controller (LUIS CARLOS - Secc 5)  │
│   );                                                        │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ src/middlewares/auth.ts               (TOMÁS - Sección 6)   │
│                                                             │
│   1. Extrae token del header Authorization                  │
│   2. jwt.verify(token, JWT_SECRET)                          │
│   3. Si inválido → throw AppError(401)                      │
│   4. Si válido → req.user = payload, next()                 │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ src/middlewares/validate.ts           (TOMÁS - Sección 4)   │
│                                                             │
│   1. Valida req.body contra el schema Zod                   │
│   2. Si inválido → throw AppError(400, errores)             │
│   3. Si válido → next()                                     │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ src/modules/properties/property.controller.ts               │
│                                     (LUIS CARLOS - Secc 5)  │
│                                                             │
│   1. Extrae datos validados de req.body                     │
│   2. Llama a propertyService.create(data)                   │
│   3. Envía res.status(201).json(result)                     │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ src/modules/properties/property.service.ts                  │
│                                     (LUIS CARLOS - Secc 5)  │
│                                                             │
│   1. prisma.property.create({ data })                       │
│   2. Retorna la propiedad creada                            │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ src/db/prisma.ts                        (ya existe)         │
│                                                             │
│   PrismaClient → Adaptador PG → PostgreSQL (Supabase)      │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ prisma/schema.prisma               (TOMÁS - Sección 2)      │
│                                                             │
│   Modelos: Property, User                                   │
│   Prisma traduce operaciones a SQL real                     │
└─────────────────────────────────────────────────────────────┘
```

### Mapa de dependencias entre archivos

```
¿Quién depende de quién? (→ significa "importa de")

property.routes.ts → property.controller.ts
                   → property.schema.ts (schemas Zod)
                   → auth middleware
                   → validate middleware

property.controller.ts → property.service.ts

property.service.ts → prisma.ts (instancia de Prisma)
                    → AppError (para lanzar errores)

auth.service.ts → prisma.ts
                → bcrypt (para comparar passwords)
                → jsonwebtoken (para generar tokens)
                → AppError

auth middleware → jsonwebtoken (para verificar tokens)
               → AppError

validate middleware → Zod schemas
                   → AppError

errorHandler middleware → AppError (para detectar tipo de error)
```

### Orden de integración (cuándo se unen las partes)

| Paso | Luis Carlos hace | Tomás hace | Se integra |
|------|-----------------|------------|------------|
| 1 | Estructura de carpetas + app.ts | Migración + seed | Tomás necesita la estructura lista |
| 2 | AppError + errorHandler | Schemas Zod + validate middleware | validate usa AppError |
| 3 | CRUD (service + controller + routes) | Auth (service + controller + routes + middleware) | Las rutas POST/PUT/DELETE necesitan el auth middleware |
| 4 | Seguridad (helmet, rate limit) | — | Luis Carlos lo agrega en app.ts |

---

## 📁 Estructura Final del Proyecto

```
Properties/
├── prisma/
│   ├── schema.prisma          ← Modelos de la DB (TOMÁS)
│   ├── seed.ts                ← Datos de prueba (TOMÁS)
│   └── migrations/            ← Auto-generado por Prisma
├── src/
│   ├── index.ts               ← Arranca el servidor (LUIS CARLOS)
│   ├── app.ts                 ← Configura Express (LUIS CARLOS)
│   ├── config/
│   │   └── env.ts             ← Valida variables de entorno (LUIS CARLOS)
│   ├── errors/
│   │   └── AppError.ts        ← Clase de error custom (LUIS CARLOS)
│   ├── middlewares/
│   │   ├── errorHandler.ts    ← Middleware global de errores (LUIS CARLOS)
│   │   ├── auth.ts            ← Middleware JWT (TOMÁS)
│   │   └── validate.ts        ← Middleware de validación Zod (TOMÁS)
│   ├── types/
│   │   └── express.d.ts       ← Extiende tipos de Express (TOMÁS)
│   ├── modules/
│   │   ├── properties/
│   │   │   ├── property.routes.ts      ← (LUIS CARLOS)
│   │   │   ├── property.controller.ts  ← (LUIS CARLOS)
│   │   │   ├── property.service.ts     ← (LUIS CARLOS)
│   │   │   └── property.schema.ts      ← (TOMÁS)
│   │   └── auth/
│   │       ├── auth.routes.ts          ← (TOMÁS)
│   │       ├── auth.controller.ts      ← (TOMÁS)
│   │       ├── auth.service.ts         ← (TOMÁS)
│   │       └── auth.schema.ts          ← (TOMÁS)
│   └── db/
│       └── prisma.ts          ← Instancia de Prisma (ya existe)
├── docs/
│   └── guides/                ← Estas guías
├── .env                       ← Variables secretas (NO va a git)
├── .gitignore
├── package.json
├── tsconfig.json
└── prisma.config.ts
```

---

## 🧪 Checklist de Verificación Final

Cuando ambos terminen, la API debe pasar TODAS estas pruebas:

### Funcionalidad
- [ ] `GET /api/v1/properties` retorna lista con paginación
- [ ] `GET /api/v1/properties?location=Medellin&minPrice=100000000&page=1&limit=5` filtra correctamente
- [ ] `GET /api/v1/properties/:id` retorna una propiedad específica
- [ ] `GET /api/v1/properties/99999` retorna 404
- [ ] `POST /api/v1/properties` sin token retorna 401
- [ ] `POST /api/v1/properties` con token y body válido retorna 201
- [ ] `POST /api/v1/properties` con body vacío retorna 400 con errores claros
- [ ] `PUT /api/v1/properties/:id` actualiza correctamente
- [ ] `DELETE /api/v1/properties/:id` elimina correctamente
- [ ] `POST /api/v1/auth/login` con credenciales válidas retorna token
- [ ] `POST /api/v1/auth/login` con credenciales inválidas retorna 401

### Seguridad
- [ ] Headers de seguridad presentes (helmet)
- [ ] Rate limiting funciona (6 intentos rápidos de login → 429)
- [ ] Passwords hasheadas en DB (no en texto plano)
- [ ] JWT tiene expiración
- [ ] `.env` NO está en el repositorio

### Código
- [ ] Estructura de carpetas clara y organizada
- [ ] Cada archivo tiene UNA responsabilidad
- [ ] No hay `try/catch` repetido — el errorHandler central lo maneja
- [ ] Commits claros de ambos integrantes
