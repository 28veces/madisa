"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function updateProfilePhoto(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autenticado" };

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return { error: "Selecciona una imagen" };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: "Formato no soportado (usa JPG, PNG o WEBP)" };
  if (file.size > MAX_SIZE) return { error: "La imagen no puede superar 5MB" };

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadsDir, { recursive: true });

  const ext = file.type.split("/")[1];
  const fileName = `${session.user.id}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, fileName), buffer);

  const imageUrl = `/uploads/avatars/${fileName}`;
  await prisma.user.update({
    where: { id: session.user.id },
    data: { imageUrl },
  });

  revalidatePath("/admin/perfil");
  return { success: true, imageUrl };
}

export async function updateProfileName(name: string) {
  const session = await auth();
  if (!session?.user) return { error: "No autenticado" };
  if (!name.trim()) return { error: "Nombre requerido" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
  });

  revalidatePath("/admin/perfil");
  return { success: true };
}
