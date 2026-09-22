"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { updateProfilePhoto, updateProfileName } from "@/actions/profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Pencil, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function ProfileHeader({
  name,
  email,
  imageUrl,
  roleLabel,
  roleColor,
  memberSinceLabel,
}: {
  name: string;
  email: string;
  imageUrl: string | null;
  roleLabel: string;
  roleColor: string;
  memberSinceLabel: string;
}) {
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [savingName, setSavingName] = useState(false);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("photo", file);
    const result = await updateProfilePhoto(formData);
    setUploading(false);

    if (result?.error) return toast.error(result.error);

    setPhoto(result.imageUrl ?? null);
    await update({ image: result.imageUrl });
    toast.success("Foto de perfil actualizada");
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) return toast.error("Nombre requerido");
    setSavingName(true);
    const result = await updateProfileName(nameValue);
    setSavingName(false);

    if (result?.error) return toast.error(result.error);

    toast.success("Nombre actualizado");
    setEditingName(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="relative group">
          <div className="h-32 w-32 rounded-full overflow-hidden ring-4 ring-offset-2 ring-rose-100 bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
            {photo ? (
              <Image src={photo} alt={name} width={128} height={128} className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl font-semibold text-white">{initials(name || email)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={uploading}
            className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center ring-2 ring-white transition-colors"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        {editingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className="text-center max-w-xs"
              autoFocus
            />
            <Button size="sm" variant="outline" onClick={handleSaveName} disabled={savingName}>
              {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setEditingName(false); setNameValue(name); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-rose-600 transition-colors"
          >
            {name || "Sin nombre"}
            <Pencil className="h-4 w-4 text-gray-400" />
          </button>
        )}

        <p className="text-gray-500 text-sm -mt-2">{email}</p>

        <Badge className={roleColor}>{roleLabel}</Badge>

        <p className="text-xs text-gray-400">Miembro desde {memberSinceLabel}</p>
      </div>
    </div>
  );
}
