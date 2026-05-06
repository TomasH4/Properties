// ===== PASO 2.3: Seed de la base de datos =====
import prisma from "../src/db/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Hashear la contraseña del admin (10 = salt rounds, estándar seguro)
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Crear usuario admin (upsert = crear si no existe, actualizar si existe)
  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {}, // Si ya existe, no cambiar nada
    create: {
      name: "Admin",
      email: "admin@test.com",
      password: hashedPassword,
    },
  });
  console.log("✅ Usuario admin creado");

  // Crear 5 propiedades de ejemplo (skipDuplicates evita error si ya existen)
  await prisma.property.createMany({
    data: [
      { title: "Apartamento en El Poblado", price: 350000000, location: "Medellín" },
      { title: "Casa en Envigado", price: 450000000, location: "Envigado" },
      { title: "Oficina en Laureles", price: 280000000, location: "Medellín" },
      { title: "Penthouse en Sabaneta", price: 600000000, location: "Sabaneta" },
      { title: "Local Comercial Centro", price: 180000000, location: "Medellín", available: false },
    ],
    skipDuplicates: true,
  });
  console.log("✅ 5 propiedades creadas");
}

// Llamar main con manejo de errores
main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // Siempre cerrar la conexión al terminar
  });
