"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness, getActiveBusinessId } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Category, Technique, UserRole } from "@prisma/client";
import { saveUploadedImage } from "@/lib/upload";
import { randomUUID } from "crypto";
import { stockInclude, availableStock } from "@/lib/stock";
import { DEFAULT_BACKORDER_LIMIT, MAX_ORDER_QUANTITY } from "@/lib/utils";

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
  allowBackorder: z.boolean().default(false),
  backorderLimit: z.coerce.number().int("Debe ser un número entero").min(1, "Mínimo 1").max(MAX_ORDER_QUANTITY, `Máximo ${MAX_ORDER_QUANTITY}`).default(DEFAULT_BACKORDER_LIMIT),
});

// Solo el ADMIN decide si un producto se puede pedir bajo pedido (US-64) y cuántas unidades
// sin stock acepta cada pedido (US-67). Si el campo no viene en el formulario o lo envía
// otro rol, se conserva el valor actual (el valor por defecto al crear).
function backorderValue<T>(role: UserRole, formData: FormData, field: string, requested: T, current: T) {
  return role === UserRole.ADMIN && formData.has(field) ? requested : current;
}

// El artículo de inventario vinculado, si viene, debe ser del negocio de la sesión.
async function isValidInventoryItem(businessId: string, inventoryItemId: string | undefined) {
  if (!inventoryItemId) return true;
  const item = await prisma.inventoryItem.findFirst({ where: { id: inventoryItemId, businessId }, select: { id: true } });
  return !!item;
}

export async function createProduct(formData: FormData) {
  const { businessId, role } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
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
    allowBackorder: formData.get("allowBackorder") === "true",
    backorderLimit: formData.get("backorderLimit") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  if (!(await isValidInventoryItem(businessId, parsed.data.inventoryItemId || undefined))) {
    return { error: { inventoryItemId: ["Artículo de inventario no encontrado"] } };
  }

  const photo = formData.get("photo") as File | null;
  if (photo && photo.size > 0) {
    const uploaded = await saveUploadedImage(photo, "products", randomUUID());
    if ("error" in uploaded) return { error: { photo: [uploaded.error] } };
    parsed.data.imageUrl = uploaded.url;
  }

  const { inventoryItemId, allowBackorder, backorderLimit, ...rest } = parsed.data;
  await prisma.product.create({
    data: {
      ...rest,
      allowBackorder: backorderValue(role, formData, "allowBackorder", allowBackorder, false),
      backorderLimit: backorderValue(role, formData, "backorderLimit", backorderLimit, DEFAULT_BACKORDER_LIMIT),
      businessId,
      ...(inventoryItemId ? { inventoryItemId } : {}),
    },
  });
  revalidatePath("/admin/catalogo");
  revalidatePath("/catalogo");
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
  const { businessId, role } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
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
    allowBackorder: formData.get("allowBackorder") === "true",
    backorderLimit: formData.get("backorderLimit") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  if (!(await isValidInventoryItem(businessId, parsed.data.inventoryItemId || undefined))) {
    return { error: { inventoryItemId: ["Artículo de inventario no encontrado"] } };
  }

  const photo = formData.get("photo") as File | null;
  if (photo && photo.size > 0) {
    const uploaded = await saveUploadedImage(photo, "products", id);
    if ("error" in uploaded) return { error: { photo: [uploaded.error] } };
    parsed.data.imageUrl = uploaded.url;
  }

  const { inventoryItemId, allowBackorder, backorderLimit, ...rest } = parsed.data;
  await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      allowBackorder: backorderValue(role, formData, "allowBackorder", allowBackorder, product.allowBackorder),
      backorderLimit: backorderValue(role, formData, "backorderLimit", backorderLimit, product.backorderLimit),
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
        include: stockInclude,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

const publicProductsSchema = z.object({
  category: z.nativeEnum(Category).optional(),
  search: z.string().trim().max(100).optional(),
});

// Minúsculas y sin tildes, para que "lapida" encuentre "Lápida" (US-65)
function normalizeText(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export async function getPublicProducts(category?: Category, search?: string) {
  const parsed = publicProductsSchema.safeParse({ category, search });
  if (!parsed.success) return [];

  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const term = parsed.data.search ? normalizeText(parsed.data.search) : "";

  const products = await prisma.product.findMany({
    where: {
      businessId,
      isActive: true,
      ...(parsed.data.category ? { category: parsed.data.category } : {}),
    },
    include: {
      inventoryItem: {
        include: stockInclude,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.filter((p) => {
    if (term && !normalizeText(p.name).includes(term)) return false;
    if (!p.inventoryItemId) return true; // arreglos u otros sin inventario
    if (p.allowBackorder) return true; // bajo pedido: se muestra aunque no haya stock (US-64)
    return availableStock(p.inventoryItem!) > 0;
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
        include: stockInclude,
      },
    },
  });
}
