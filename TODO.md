# 🚀 Práctica Backend en Parejas (Nivel Intermedio)

## 📌 API REST con Node.js + Express + PostgreSQL + JWT

## 🎯 Objetivo

Construir una API REST profesional que incluya:

- Persistencia en base de datos (PostgreSQL)
- Autenticación con JWT
- Validación de datos
- Filtros + paginación
- Versionamiento de API
- Organización de código (Clean Architecture recomendada)

## 👥 Modalidad

- Trabajo en parejas
- Entrega: repositorio en GitHub
- Debe evidenciarse trabajo colaborativo en commits ⚠️
- Se realizará sustentación

## 🧠 Contexto del proyecto

### 🏠 Sistema de Gestión de Propiedades (Real Estate)

La API debe simular un backend real listo para producción.

## 🗄️ Base de Datos (OBLIGATORIO)

✅ PostgreSQL

Opciones:

- Supabase (recomendado)
- PostgreSQL local

## ⚙️ Acceso a la base de datos

### ✅ Opciones permitidas

#### 🟢 Opción 1 (Recomendada)

ORM:

- Prisma
- Sequelize

👉 Ya visto en clase, deben aplicarlo correctamente.

#### 🟡 Opción 2

SQL nativo (queries directas):

- Uso de librerías como `pg`
- Escritura manual de queries SQL

### 🎯 Consideraciones

- Deben elegir una sola opción
- La implementación debe ser clara y funcional
- Deben entender lo que están haciendo (se validará en la sustentación)

### 💡 Recomendación

Se recomienda usar ORM para mantener una mejor organización y escalabilidad del proyecto, pero SQL nativo es válido si está bien implementado.

## 🧱 Modelo mínimo: `properties`

```json
{
  "id": 1,
  "title": "Apartamento en Medellín",
  "price": 350000000,
  "location": "El Poblado",
  "available": true,
  "createdAt": "2026-04-28"
}
```

## 🌐 Versionamiento de API (OBLIGATORIO)

Todos los endpoints deben tener prefijo:

```http
/api/v1
```

Ejemplo:

```http
GET /api/v1/properties
```

## 🔐 Autenticación (JWT) - OBLIGATORIO

### 📌 Endpoint requerido

```http
POST /api/v1/auth/login
```

```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

Respuesta:

```json
{
  "token": "JWT_TOKEN"
}
```

### 🔒 Protección de rutas

Deben proteger:

- `POST /api/v1/properties`
- `PUT /api/v1/properties/:id`
- `DELETE /api/v1/properties/:id`

Header:

```http
Authorization: Bearer TOKEN
```

## 🔥 Requerimientos obligatorios

### 1️⃣ CRUD completo

- `GET /api/v1/properties`
- `GET /api/v1/properties/:id`
- `POST /api/v1/properties` 🔒
- `PUT /api/v1/properties/:id` 🔒
- `DELETE /api/v1/properties/:id` 🔒

### 2️⃣ Validación de datos (CRÍTICO) ⚠️ - INVESTIGACIÓN

Deben validar:

#### 🔹 Body

- `title` -> requerido
- `price` -> número
- `location` -> requerido
- `available` -> boolean

#### 🔹 Params

- `id` -> número válido

#### 🔹 Query params

- `location` -> string
- `minPrice` / `maxPrice` -> número
- `page` / `limit` -> número

#### 🧪 Implementación - INVESTIGACIÓN 

Pueden usar:

- Joi
- Zod
- class-validator
- Validación manual

🚨 Importante: no validar correctamente = API incorrecta ❌

### 3️⃣ Filtros + Paginación (OBLIGATORIO)

📌 Endpoint:

```http
GET /api/v1/properties?location=Medellin&minPrice=100000000&page=1&limit=5
```

Debe incluir:

- Filtros por `location`
- Rango de precio
- Paginación

Respuesta:

```json
{
  "data": [],
  "total": 50,
  "page": 1,
  "limit": 5
}
```

### 4️⃣ Manejo de errores

- `400` -> datos inválidos
- `401` -> no autorizado
- `404` -> no encontrado
- `500` -> error interno

### 5️⃣ Variables de entorno

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

## 🧱 Estructura del proyecto

### 🔓 Libre

### ⭐ Recomendado (Clean Architecture)

```text
src/
  domain/
  application/
  infrastructure/
  interfaces/
```

O simplificado:

```text
src/
  routes/
  controllers/
  services/
  db/
  middlewares/
```

## 👨‍💻 Trabajo en equipo (OBLIGATORIO)

- Ambos integrantes deben tener commits en el repositorio
- Commits deben ser claros (no solo "update")
- Se evaluará participación de ambos

## 🗣️ Sustentación (OBLIGATORIO)

- Arquitectura del proyecto
- Cómo funciona la conexión a DB
- Cómo implementaron JWT
- Cómo manejaron validaciones
- Flujo de un endpoint completo


## 🧾 Entregables

Repositorio con:

- Código funcional
- README con:
  - Setup
  - Endpoints
  - Cómo obtener token
  - Ejemplos
  - Decisiones técnicas

## 🧠 Qué se evalúa

### 🟢 Backend

- CRUD completo
- HTTP correcto

### 🟢 Base de datos

- PostgreSQL + ORM

### 🟢 Seguridad

- JWT funcionando
- Rutas protegidas

### 🟢 Validaciones (CRÍTICO)

- Body
- Params
- Query

### 🟢 Funcionalidad

- Filtros
- Paginación

### 🟢 Código

- Organización
- Claridad

### 🟢 Trabajo en equipo

- Commits de ambos
- Sustentación

## 💡 Nota final para estudiantes

Esta práctica representa un backend real.  
Si pueden construir y explicar esto, ya están trabajando a nivel junior profesional.