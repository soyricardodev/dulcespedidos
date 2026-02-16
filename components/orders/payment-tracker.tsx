"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Loader2, Trash2, DollarSign, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { addPayment, deletePayment } from "@/lib/actions";

interface Payment {
  id: number;
  orderId: number;
  amount: number;
  status: string;
  paidAt: Date | null;
  createdAt: Date | null;
}

interface PaymentTrackerProps {
  orderId: number;
  totalAmount: number;
  payments: Payment[];
  onUpdate: () => void;
}

export function PaymentTracker({ orderId, totalAmount, payments, onUpdate }: PaymentTrackerProps) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalAmount - totalPaid;

  const handleAddPayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    startTransition(async () => {
      await addPayment({ orderId, amount: parseFloat(amount) });
      setAmount("");
      toast.success("Pago registrado");
      onUpdate();
    });
  };

  const handleDeletePayment = (paymentId: number) => {
    startTransition(async () => {
      await deletePayment(paymentId, orderId);
      toast.success("Pago eliminado");
      onUpdate();
    });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Pagos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="font-semibold">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Pagado</p>
            <p className="font-semibold text-green-600">${totalPaid.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Pendiente</p>
            <p className="font-semibold text-orange-600">${remaining.toFixed(2)}</p>
          </div>
        </div>

        {remaining > 0 && (
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder="Monto"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddPayment} disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        )}

        {payments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Historial</p>
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="font-medium">${payment.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString("es-ES")
                          : "Fecha no disponible"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePayment(payment.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
