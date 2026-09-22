import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function saveUploadedImage(file: File, subfolder: string, keyPrefix: string) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Formato no soportado (usa JPG, PNG o WEBP)" } as const;
  }
  if (file.size > MAX_SIZE) {
    return { error: "La imagen no puede superar 5MB" } as const;
  }

  const ext = file.type.split("/")[1];
  const fileName = `${keyPrefix}-${Date.now()}.${ext}`;

  // Producción: Vercel Blob (el filesystem de Vercel es efímero).
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${subfolder}/${fileName}`, file, {
      access: "public",
      contentType: file.type,
    });
    return { url: blob.url } as const;
  }

  // Desarrollo local: disco.
  const uploadsDir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, fileName), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${subfolder}/${fileName}` } as const;
}
