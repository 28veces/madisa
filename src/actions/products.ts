"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness, getActiveBusinessId } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Category, Technique, UserRole } from "@prisma/client";
import { saveUploadedImage } from "@/lib/upload";
import { randomUUID } from "crypto";

const productSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  category: z.nativeEnum(Category),
  material: z.string().min(1, "Material requerido"),
  technique: z.nativeEnum(Technique),
  basePrice: z.coerce.number().min(0),
  imageUrl: z.string().url().optional().or(z.literal("")),
  inventoryItemId: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export async function createProduct(formData: FormData) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    material: formData.get("material"),
    technique: formData.get("technique"),
    basePrice: formData.get("basePrice"),
    imageUrl: formData.get("imageUrl") || undefined,
    inventoryItemId: formData.get("inventoryItemId") || undefined,
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const photo = formData.get("photo") as File | null;
  if (photo && photo.size > 0) {
    const uploaded = await saveUploadedImage(photo, "products", randomUUID());
    if ("error" in uploaded) return { error: { photo: [uploaded.error] } };
    parsed.data.imageUrl = uploaded.url;
  }

  const { inventoryItemId, ...rest } = parsed.data;
  await prisma.product.create({
    data: {
      ...rest,
      businessId,
      ...(inventoryItemId ? { inventoryItemId } : {}),
    },
  });
  revalidatePath("/admin/catalogo");
  revalidatePath("/catalogo");
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.businessId !== businessId) throw new Error("Sin permiso");

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    material: formData.get("material"),
    technique: formData.get("technique"),
    basePrice: formData.get("basePrice"),
    imageUrl: formData.get("imageUrl") || undefined,
    inventoryItemId: formData.get("inventoryItemId") || undefined,
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const photo = formData.get("photo") as File | null;
  if (photo && photo.size > 0) {
    const uploaded = await saveUploadedImage(photo, "products", id);
    if ("error" in uploaded) return { error: { photo: [uploaded.error] } };
    parsed.data.imageUrl = uploaded.url;
  }

  const { inventoryItemId, ...rest } = parsed.data;
  await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      inventoryItemId: inventoryItemId || null,
    },
  });
  revalidatePath("/admin/catalogo");
  revalidatePath("/catalogo");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.businessId !== businessId) throw new Error("Sin permiso");

  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/catalogo");
  revalidatePath("/catalogo");
  return { success: true };
}

export async function getProducts(category?: Category, activeOnly = false) {
  const { businessId } = await requireBusiness([
    UserRole.ADMIN,
    UserRole.SECRETARY,
    UserRole.ACCOUNTANT,
  ]);
  return prisma.product.findMany({
    where: {
      businessId,
      ...(category ? { category } : {}),
      ...(activeOnly ? { isActive: true } : {}),
    },
    include: {
      inventoryItem: {
        include: {
          purchaseItems: { select: { quantity: true } },
          saleItems: { select: { quantity: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublicProducts(category?: Category) {
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const products = await prisma.product.findMany({
    where: {
      businessId,
      isActive: true,
      ...(category ? { category } : {}),
    },
    include: {
      inventoryItem: {
        include: {
          purchaseItems: { select: { quantity: true } },
          saleItems: { select: { quantity: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.filter((p) => {
    if (!p.inventoryItemId) return true; // arreglos u otros sin inventario
    const purchased = p.inventoryItem!.purchaseItems.reduce((s, i) => s + i.quantity, 0);
    const sold = p.inventoryItem!.saleItems.reduce((s, i) => s + i.quantity, 0);
    return purchased - sold > 0;
  });
}

export async function getProduct(id: string) {
  const { businessId } = await requireBusiness([
    UserRole.ADMIN,
    UserRole.SECRETARY,
    UserRole.ACCOUNTANT,
  ]);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { inventoryItem: true },
  });
  if (!product || product.businessId !== businessId) throw new Error("Sin permiso");
  return product;
}

export async function getPublicProduct(id: string) {
  const businessId = await getActiveBusinessId();
  if (!businessId) return null;

  return prisma.product.findUnique({
    where: { id, isActive: true, businessId },
    include: {
      inventoryItem: {
        include: {
          purchaseItems: { select: { quantity: true } },
          saleItems: { select: { quantity: true } },
        },
      },
    },
  });
}
