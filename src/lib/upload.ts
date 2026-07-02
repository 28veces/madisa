import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function saveUploadedImage(file: File, subfolder: string, keyPrefix: string) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Formato no soportado (usa JPG, PNG o WEBP)" } as const;
  }
  if (file.size > MAX_SIZE) {
    return { error: "La imagen no puede superar 5MB" } as const;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(uploadsDir, { recursive: true });

  const ext = file.type.split("/")[1];
  const fileName = `${keyPrefix}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, fileName), buffer);

  return { url: `/uploads/${subfolder}/${fileName}` } as const;
}
