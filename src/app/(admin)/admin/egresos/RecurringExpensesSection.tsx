"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarClock, Check, Pencil, Plus, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { confirmRecurringPayment, skipRecurringPayment } from "@/actions/recurring-expenses";
import { frequencyLabel, todayISO } from "@/lib/recurrence";
import { formatCurrency, parseNumberField, type NumberField } from "@/lib/utils";

export interface RecurringRow {
  id: string;
  description: string;
  category: string;
  amount: number;
  frequency: string;
  nextDueISO: string; // AAAA-MM-DD del periodo pendiente
  nextDueLabel: string; // fecha ya formateada en el servidor
  isActive: boolean;
  isDue: boolean;
}

interface Props {
  rows: RecurringRow[];
  canManage: boolean;
}

export default function RecurringExpensesSection({ rows, canManage }: Props) {
  const [paying, setPaying] = useState<RecurringRow | null>(null);
  const [skipping, setSkipping] = useState<RecurringRow | null>(null);
  const [amount, setAmount] = useState<NumberField>("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const dueCount = rows.filter((r) => r.isDue).length;

  const openPay = (row: RecurringRow) => {
    setPaying(row);
    setAmount(row.amount);
    setDate(todayISO());
  };

  const handleConfirm = async () => {
    if (!paying) return;
    if (amount === "" || amount <= 0) return toast.error("Escribe el monto pagado");
    setLoading(true);
    try {
      const result = await confirmRecurringPayment(paying.id, { amount, date, dueDate: paying.nextDueISO });
      if (result.error) return toast.error(result.error);
      toast.success("Pago registrado como egreso");
      setPaying(null);
    } catch {
      toast.error("No se pudo registrar el pago");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!skipping) return;
    setLoading(true);
    try {
      const result = await skipRecurringPayment(skipping.id, skipping.nextDueISO);
      if (result.error) return toast.error(result.error);
      toast.success("Pago omitido; se movió la próxima fecha");
      setSkipping(null);
    } catch {
      toast.error("No se pudo omitir el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Egresos fijos</h2>
          {dueCount > 0 && (
            <Badge className="bg-amber-100 text-amber-800">
              {dueCount} {dueCount === 1 ? "pendiente" : "pendientes"}
            </Badge>
          )}
        </div>
        {canManage && (
          <Link href="/admin/egresos/fijos/nuevo">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nuevo egreso fijo
            </Button>
          </Link>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 px-4 py-6 text-center">
          Sin egresos fijos. Agrega los que se repiten (fumigación, permisos, alquiler…) y te avisamos cuando toque pagarlos.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-4 font-medium text-gray-600">Descripción</th>
                <th className="text-left py-2 px-4 font-medium text-gray-600">Frecuencia</th>
                <th className="text-right py-2 px-4 font-medium text-gray-600">Monto estimado</th>
                <th className="text-left py-2 px-4 font-medium text-gray-600">Próximo pago</th>
                {canManage && <th className="py-2 px-4" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((r) => (
                <tr key={r.id} className={r.isDue ? "bg-amber-50/60" : r.isActive ? "" : "opacity-50"}>
                  <td className="py-2 px-4">
                    <p className="font-medium text-gray-900">{r.description}</p>
                    <p className="text-xs text-gray-500">{r.category}</p>
                  </td>
                  <td className="py-2 px-4 text-gray-600">{frequencyLabel(r.frequency)}</td>
                  <td className="py-2 px-4 text-right font-semibold text-gray-900">{formatCurrency(r.amount)}</td>
                  <td className="py-2 px-4 text-gray-600">
                    {r.nextDueLabel}{" "}
                    {r.isDue && <Badge className="bg-amber-100 text-amber-800 ml-1">Toca pagar</Badge>}
                    {!r.isActive && <Badge variant="outline" className="ml-1">Inactivo</Badge>}
                  </td>
                  {canManage && (
                    <td className="py-2 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {r.isDue && (
                          <>
                            <Button size="sm" className="bg-rose-600 hover:bg-rose-700 h-8" onClick={() => openPay(r)}>
                              <Check className="h-4 w-4 mr-1" /> Confirmar pago
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-gray-500" onClick={() => setSkipping(r)}>
                              <SkipForward className="h-4 w-4 mr-1" /> Omitir
                            </Button>
                          </>
                        )}
                        <Link href={`/admin/egresos/fijos/${r.id}`} aria-label={`Editar ${r.description}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!paying} onOpenChange={(o) => !o && setPaying(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar pago</DialogTitle>
            <DialogDescription>
              Se registrará un egreso de &ldquo;{paying?.description}&rdquo; y la próxima fecha avanzará{" "}
              {paying ? frequencyLabel(paying.frequency).toLowerCase() : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="payAmount" className="block text-sm font-medium text-gray-700 mb-1">Monto pagado</label>
              <input
                id="payAmount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(parseNumberField(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label htmlFor="payDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha del pago</label>
              <input
                id="payDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaying(null)}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={loading} className="bg-rose-600 hover:bg-rose-700">
              {loading ? "Guardando..." : "Registrar pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!skipping} onOpenChange={(o) => !o && setSkipping(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Omitir este pago</DialogTitle>
            <DialogDescription>
              No se registra ningún egreso de &ldquo;{skipping?.description}&rdquo;; solo se mueve la próxima fecha.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkipping(null)}>Cancelar</Button>
            <Button onClick={handleSkip} disabled={loading}>
              {loading ? "Guardando..." : "Omitir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
