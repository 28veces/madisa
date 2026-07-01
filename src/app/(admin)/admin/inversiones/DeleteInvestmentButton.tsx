"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteInvestment } from "@/actions/investments";
import { useRouter } from "next/navigation";

export default function DeleteInvestmentButton({ id, description }: { id: string; description: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteInvestment(id);
    setLoading(false);
    if (result.success) {
      toast.success("Inversión eliminada");
      setOpen(false);
      router.refresh();
    } else {
      toast.error("Error al eliminar la inversión");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" />}>
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar inversión</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar &ldquo;{description}&rdquo;? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
