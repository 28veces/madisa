"use client";

import { useState } from "react";
import { createBusinessUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function UserManagementForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "SECRETARY" as "SECRETARY" | "ACCOUNTANT",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("Nombre requerido");
    if (!formData.email.trim()) return toast.error("Email requerido");
    if (formData.password.length < 6) return toast.error("Contraseña debe tener al menos 6 caracteres");

    setLoading(true);
    try {
      const result = await createBusinessUser(formData) as any;
      setLoading(false);

      if (result?.error) {
        const errorMsg = typeof result.error === "string"
          ? result.error
          : "Error al crear el usuario";
        return toast.error(errorMsg);
      }

      toast.success("Usuario creado exitosamente");
      setFormData({ name: "", email: "", password: "", role: "SECRETARY" });
      setOpen(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error al crear el usuario");
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(!open)} className="bg-rose-600 hover:bg-rose-700">
        <Loader2 className="h-4 w-4 mr-2" />
        Agregar usuario
      </Button>

      {open && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crear nuevo usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: María García"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Rol *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as any })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SECRETARY">Secretario/a</SelectItem>
                    <SelectItem value="ACCOUNTANT">Contador/a</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Crear usuario
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
