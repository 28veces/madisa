"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPartner, updatePartner, deletePartner } from "@/actions/partners";
import { useRouter } from "next/navigation";

interface Partner {
  id: string;
  name: string;
  percentage: string | number;
  order: number;
}

interface Props {
  partners: Partner[];
  totalPct: number;
}

export default function SociosClient({ partners, totalPct }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPct, setEditPct] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPct, setNewPct] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim() || !newPct) return toast.error("Completa nombre y porcentaje");
    setLoading(true);
    const fd = new FormData();
    fd.set("name", newName.trim());
    fd.set("percentage", newPct);
    fd.set("order", String(partners.length));
    const result = await createPartner(fd);
    setLoading(false);
    if (result.error) {
      const msg = typeof result.error === "object" && "percentage" in result.error
        ? (result.error.percentage as string[])[0]
        : "Error al crear";
      return toast.error(msg);
    }
    toast.success("Socio creado");
    setShowNew(false);
    setNewName("");
    setNewPct("");
    router.refresh();
  };

  const handleEdit = (p: Partner) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPct(String(Number(p.percentage)));
  };

  const handleSaveEdit = async (id: string, order: number) => {
    if (!editName.trim() || !editPct) return toast.error("Completa nombre y porcentaje");
    setLoading(true);
    const fd = new FormData();
    fd.set("name", editName.trim());
    fd.set("percentage", editPct);
    fd.set("order", String(order));
    const result = await updatePartner(id, fd);
    setLoading(false);
    if (result.error) {
      const msg = typeof result.error === "object" && "percentage" in result.error
        ? (result.error.percentage as string[])[0]
        : "Error al guardar";
      return toast.error(msg);
    }
    toast.success("Socio actualizado");
    setEditingId(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este socio?")) return;
    setLoading(true);
    await deletePartner(id);
    setLoading(false);
    toast.success("Socio eliminado");
    router.refresh();
  };

  const remaining = 100 - totalPct;

  return (
    <div className="space-y-4">
      {/* Barra de porcentaje total */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Porcentaje asignado</span>
          <span className={`font-semibold ${totalPct > 100 ? "text-red-600" : totalPct === 100 ? "text-green-600" : "text-amber-600"}`}>
            {totalPct.toFixed(1)}% / 100%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${totalPct > 100 ? "bg-red-500" : totalPct === 100 ? "bg-green-500" : "bg-amber-400"}`}
            style={{ width: `${Math.min(totalPct, 100)}%` }}
          />
        </div>
        {remaining > 0 && (
          <p className="text-xs text-gray-400 mt-1">{remaining.toFixed(1)}% sin asignar</p>
        )}
      </div>

      {/* Lista de socios */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Socio</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">% Ganancias</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {partners.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-400">
                  Sin socios. Agrega el primero.
                </td>
              </tr>
            )}
            {partners.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50">
                <td className="py-3 px-4">
                  {editingId === p.id ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm" autoFocus />
                  ) : (
                    <span className="font-medium text-gray-900">{p.name}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {editingId === p.id ? (
                    <Input type="number" min={0} max={100} step="0.1" value={editPct} onChange={(e) => setEditPct(e.target.value)} className="h-8 text-sm w-24 ml-auto" />
                  ) : (
                    <span className="text-gray-700">{Number(p.percentage).toFixed(1)}%</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editingId === p.id ? (
                      <>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={() => handleSaveEdit(p.id, p.order)} disabled={loading}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700" onClick={() => handleEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(p.id)} disabled={loading}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {showNew && (
              <tr className="bg-rose-50/40">
                <td className="py-3 px-4">
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del socio" className="h-8 text-sm" autoFocus />
                </td>
                <td className="py-3 px-4 text-right">
                  <Input type="number" min={0} max={100} step="0.1" value={newPct} onChange={(e) => setNewPct(e.target.value)} placeholder="0" className="h-8 text-sm w-24 ml-auto" />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={handleCreate} disabled={loading}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={() => { setShowNew(false); setNewName(""); setNewPct(""); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {!showNew && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4 mr-1" /> Agregar socio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
