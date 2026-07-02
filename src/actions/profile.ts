"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { saveUploadedImage } from "@/lib/upload";

export async function updateProfilePhoto(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autenticado" };

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return { error: "Selecciona una imagen" };

  const result = await saveUploadedImage(file, "avatars", session.user.id);
  if ("error" in result) return { error: result.error };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { imageUrl: result.url },
  });

  revalidatePath("/admin/perfil");
  return { success: true, imageUrl: result.url };
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
