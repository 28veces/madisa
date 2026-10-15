import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

// Contraseña inicial de un usuario del seed: se toma de la variable de entorno o se genera
// al azar y se imprime una sola vez. Nunca se escribe en el código (repo público).
function initialPassword(envVar: string, email: string) {
  const fromEnv = process.env[envVar];
  if (fromEnv) return fromEnv;
  const generated = randomBytes(12).toString("base64url");
  console.log(`🔑 Contraseña generada para ${email}: ${generated} (defínela con ${envVar} para fijarla)`);
  return generated;
}

async function main() {
  // Create bootstrap business
  const business = await prisma.business.upsert({
    where: { slug: "artemadisa" },
    update: {},
    create: {
      name: "Arte Madisa",
      slug: "artemadisa",
      isActive: true,
    },
  });
  console.log("✅ Negocio creado:", business.name);

  // Create super admin user
  const superAdminExists = await prisma.user.findUnique({ where: { email: "super@sistema.com" } });
  const superAdminHash = superAdminExists
    ? ""
    : await bcrypt.hash(initialPassword("SEED_SUPER_PASSWORD", "super@sistema.com"), 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: "super@sistema.com" },
    update: {},
    create: {
      email: "super@sistema.com",
      passwordHash: superAdminHash,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      businessId: null,
    },
  });
  console.log("✅ Usuario SUPER_ADMIN creado:", superAdmin.email);

  // Create admin user for the business
  const adminExists = await prisma.user.findUnique({ where: { email: "admin@artemadisa.com" } });
  const adminHash = adminExists
    ? ""
    : await bcrypt.hash(initialPassword("SEED_ADMIN_PASSWORD", "admin@artemadisa.com"), 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@artemadisa.com" },
    update: {},
    create: {
      email: "admin@artemadisa.com",
      passwordHash: adminHash,
      name: "Madisa",
      role: "ADMIN",
      businessId: business.id,
    },
  });
  console.log("✅ Usuario ADMIN creado:", adminUser.email);

  // Sample products. El stock ya no vive en Product: se calcula a partir de
  // InventoryItem (compras - ventas), así que cada producto crea su propio
  // InventoryItem y una Purchase inicial que le da el stock de arranque.
  const products = [
    {
      code: "TAZ-001",
      name: "Taza personalizada 11oz",
      description: "Taza de cerámica blanca ideal para sublimación con tu diseño favorito",
      category: "TAZAS" as const,
      material: "Cerámica",
      technique: "SUBLIMACION" as const,
      basePrice: 12.0,
      stock: 50,
    },
    {
      code: "PLA-001",
      name: "Plato decorativo redondo",
      description: "Plato de cerámica de 8 pulgadas, ideal para decoración o regalo",
      category: "PLATOS" as const,
      material: "Cerámica",
      technique: "SUBLIMACION" as const,
      basePrice: 18.0,
      stock: 20,
    },
    {
      code: "VAS-001",
      name: "Vaso arenado con nombre",
      description: "Vaso de vidrio de 16oz con técnica de arenado para nombres y frases",
      category: "VASOS" as const,
      material: "Vidrio",
      technique: "GRABADO" as const,
      basePrice: 15.0,
      stock: 30,
    },
    {
      code: "SWE-001",
      name: "Sweater con diseño bordado",
      description: "Sweater de algodón con diseño bordado personalizado",
      category: "SWEATERS" as const,
      material: "Algodón",
      technique: "BORDADO" as const,
      basePrice: 35.0,
      stock: 10,
    },
    {
      code: "PLC-001",
      name: "Placa conmemorativa",
      description: "Placa de aluminio o madera para reconocimientos y condecoraciones",
      category: "PLACAS" as const,
      material: "Aluminio",
      technique: "SUBLIMACION" as const,
      basePrice: 22.0,
      stock: 15,
    },
    {
      code: "TAZ-002",
      name: "Taza mágica que cambia de color",
      description: "Taza sensible al calor: aparece tu diseño al agregar bebida caliente",
      category: "TAZAS" as const,
      material: "Cerámica especial",
      technique: "SUBLIMACION" as const,
      basePrice: 18.0,
      stock: 25,
    },
    {
      code: "SWE-002",
      name: "Sweater con vinil personalizado",
      description: "Diseño en vinil termoadhesivo de alta calidad sobre sweater",
      category: "SWEATERS" as const,
      material: "Tela poliéster",
      technique: "VINIL" as const,
      basePrice: 28.0,
      stock: 12,
    },
    {
      code: "PLA-002",
      name: "Plato pintado a mano",
      description: "Plato cerámico decorativo pintado completamente a mano, pieza única",
      category: "PLATOS" as const,
      material: "Cerámica",
      technique: "PINTADO_A_MANO" as const,
      basePrice: 45.0,
      stock: 5,
    },
  ];

  for (const product of products) {
    const inventoryItem = await prisma.inventoryItem.upsert({
      where: { code: product.code },
      update: {},
      create: {
        code: product.code,
        description: product.name,
        category: "SUBLIMABLE",
        businessId: business.id,
      },
    });

    await prisma.product.upsert({
      where: { id: product.name },
      update: {},
      create: {
        id: product.name,
        name: product.name,
        description: product.description,
        category: product.category,
        material: product.material,
        technique: product.technique,
        basePrice: product.basePrice,
        businessId: business.id,
        inventoryItemId: inventoryItem.id,
      },
    });

    // Da stock inicial vía una compra, si aún no existe.
    const existingPurchase = await prisma.purchaseItem.findFirst({
      where: { inventoryItemId: inventoryItem.id },
    });
    if (!existingPurchase) {
      await prisma.purchase.create({
        data: {
          description: `Stock inicial — ${product.name}`,
          totalAmount: product.stock * (product.basePrice * 0.5),
          category: "SUBLIMABLE",
          purchaseDate: new Date(),
          businessId: business.id,
          items: {
            create: {
              description: product.name,
              quantity: product.stock,
              unitCost: product.basePrice * 0.5,
              inventoryItemId: inventoryItem.id,
            },
          },
        },
      });
    }
  }
  console.log(`✅ ${products.length} productos de muestra creados (con stock inicial vía compra)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
