# 🚀 Sistema de Gestión de Propiedades (Real Estate) - Backend

## 📌 API REST con Node.js + Express + PostgreSQL + JWT

### 📖 Descripción del Proyecto

Este proyecto consiste en el desarrollo de una API REST profesional orientada a un **Sistema de Gestión de Propiedades**. El backend está diseñado para simular un entorno real de producción y proporcionará las siguientes funcionalidades principales:

- **Gestión de Propiedades (CRUD Completo)**: Creación, lectura, actualización y eliminación de registros de propiedades.
- **Autenticación y Seguridad**: Implementación de JSON Web Tokens (JWT) para autenticar usuarios y proteger endpoints sensibles.
- **Persistencia de Datos**: Uso de PostgreSQL como base de datos relacional para el almacenamiento seguro de la información, gestionado a través de un ORM.
- **Filtros y Paginación**: Capacidad para consultar propiedades dinámicamente mediante filtros (ej. ubicación, rango de precios) y paginar los resultados.
- **Validación Estricta de Datos**: Verificación de toda la información entrante (cuerpo, parámetros y consultas) garantizando la consistencia y seguridad del sistema.
- **Arquitectura y Buenas Prácticas**: Uso de versionamiento en la API (`/api/v1`), manejo estandarizado de errores HTTP y una estructura de código orientada a la mantenibilidad (Clean Architecture).

### 👥 Integrantes

- Tomas Henao
- Luis Carlos Guerra

---

## 🛠️ Setup Inicial

Para poner a correr este proyecto en tu máquina local, seguí estos pasos. Quise mantenerlo lo más sencillo posible:

1. **Clonar el repositorio y descargar dependencias:**
   Primero, instalá todos los paquetes necesarios. Usamos `npm`:
   ```bash
   npm install
   ```

2. **Configurar las variables de entorno:**
   En la raíz del proyecto, vas a encontrar un archivo `.env.example`. Copialo y renombralo a `.env`. Ahí debes configurar la cadena de conexión a la base de datos PostgreSQL y el secreto para los tokens JWT:
   ```env
   "postgresql://postgres.fwtruagrigkfuheabdoh:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
   JWT_SECRET="tu_super_secreto_aqui"
   ```

3. **Migraciones de Base de Datos:**
   Como estamos usando Prisma, necesitamos sincronizar la base de datos con nuestro esquema inicial y, si quieres, poblarla con algunos datos de prueba (seeding):
   ```bash
   npx prisma generate
   npx prisma db push
   npm run dev:seed  # (O el comando que tengas configurado para hacer el seed)
   ```

4. **Correr el proyecto:**
   Para modo desarrollo (usando `ts-node-dev` para que reinicie solo al guardar cambios):
   ```bash
   npm run dev
   ```
   El servidor va a levantar en `http://localhost:3000`.

---

## 🔐 ¿Cómo obtener un Token JWT?

Como varios endpoints de propiedades son privados (requieren autenticación), vas a necesitar un token. 

1. **Hacé una petición POST a `/api/v1/auth/login`**.
   Tenés que enviar en el body tus credenciales (email y password). Por defecto, con el seed se crea un usuario de prueba:
   ```json
   {
     "email": "admin@example.com",
     "password": "password123"
   }
   ```
2. **Copiá el Token:**
   Si las credenciales son válidas, la API te va a devolver algo así:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR...",
     "user": {
       "id": 1,
       "email": "admin@example.com"
     }
   }
   ```
3. **Usalo en tus peticiones:**
   En todas las peticiones a rutas protegidas, debés incluir este token en los headers:
   `Authorization: Bearer <TU_TOKEN_AQUI>`

---

## 📍 Endpoints Principales

Decidí usar un versionado estándar (`/api/v1`) para evitar romper integraciones si a futuro cambiamos la estructura de los endpoints.

### 🏠 Propiedades
- **`GET /api/v1/properties`** *(Público)*
  Trae la lista de propiedades. Soporta paginación y filtros dinámicos.
- **`GET /api/v1/properties/:id`** *(Público)*
  Devuelve el detalle de una propiedad específica por su ID.
- **`POST /api/v1/properties`** *(Privado - Requiere Token)*
  Crea una nueva propiedad. Requiere `title`, `price` y `location` en el body.
- **`PUT /api/v1/properties/:id`** *(Privado - Requiere Token)*
  Actualiza una propiedad existente. Se pueden enviar campos parciales.
- **`DELETE /api/v1/properties/:id`** *(Privado - Requiere Token)*
  Elimina una propiedad.

### 🔑 Autenticación
- **`POST /api/v1/auth/login`** *(Público)*
  Valida credenciales y devuelve el token JWT para acceder a los endpoints privados.

---

## 💡 Ejemplos de uso

### 1. Filtrando Propiedades
Quiero buscar casas en "Medellín" que cuesten mínimo 100,000,000 y quiero ver la primera página mostrando solo 5 resultados:
```http
GET /api/v1/properties?location=Medellín&minPrice=100000000&page=1&limit=5
```
*(Nota sobre los filtros: `minPrice` significa "precio mayor o igual a", así que propiedades que cuesten más que eso, como 200,000,000, sí van a salir en el resultado).*

### 2. Creando una propiedad nueva (requiere token)
```http
POST /api/v1/properties
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
Content-Type: application/json

{
  "title": "Apartamento en El Poblado",
  "price": 350000000,
  "location": "Medellín",
  "available": true
}
```

---

## 🧠 Decisiones Técnicas

A la hora de estructurar este proyecto, tomamos varias decisiones clave para que el código no solo funcione bien, sino que sea robusto, fácil de mantener y de escalar a futuro:

1. **Express 5:** Optamos por usar Express 5 de una vez. La principal ventaja que nos dio es que maneja las promesas (async/await) por defecto en los controladores. Esto nos ahorra tener que envolver todas las funciones en bloques `try/catch` o usar middlewares adicionales como `express-async-errors`.
2. **Validación estricta con Zod:** En lugar de validar datos a mano con un montón de condicionales (`if (!req.body.price)...`), usamos `Zod`. Armamos un middleware genérico que intercepta la petición y valida al mismo tiempo los params, body y query contra un esquema predefinido. Además, Zod "coerciona" tipos de datos en la URL (como transformar el `?page=2` de string a number automáticamente). Tuvimos que meter un parche usando `Object.defineProperty` para poder escribir los datos sanitizados de vuelta a la `Request` de Express 5, ya que ahora propiedades como `req.query` son de solo lectura (getters).
3. **Prisma como ORM:** Elegimos Prisma porque su tipado inferido se lleva increíblemente bien con TypeScript. Evita errores de sintaxis al hacer consultas SQL y nos asegura un control muy sólido de las migraciones.
4. **Manejo de Errores Centralizado:** Implementamos una clase personalizada `AppError` que extiende el `Error` nativo y le agrega código de estado HTTP. En lugar de estar haciendo `res.status(404).json(...)` en cada controlador, simplemente lanzamos un `throw new AppError(404, "Not found")`. El middleware global captura cualquier error (hasta los inesperados de sintaxis) y le da una salida estandarizada al cliente.
5. **Arquitectura Modular:** En lugar de tener una gran carpeta de "controllers" y otra de "routes", decidimos organizar el código por "módulos" (`/modules/properties`, `/modules/auth`). Así, cada parte de la app es su propio dominio y contiene sus respectivas rutas, lógica de negocios y esquemas de validación, haciendo el código mucho más predecible.
