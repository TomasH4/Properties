import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Crear el pool de conexiones a PostgreSQL usando la URL del .env
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Crear el adaptador de Prisma para PostgreSQL
const adapter = new PrismaPg(pool);

// Crear la instancia de PrismaClient con el adaptador
// En Prisma 7, es obligatorio usar un driver adapter
const prisma = new PrismaClient({ adapter });

export default prisma;
