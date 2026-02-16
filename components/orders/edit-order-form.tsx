"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { updateOrder } from "@/lib/actions";

interface Order {
  id: number;
  type: "cake" | "pasapalos";
  description: string;
  date: Date;
  time: string;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "partial";
  status: "pending" | "in_progress" | "ready" | "delivered" | "cancelled";
}

interface EditOrderFormProps {
  order: Order;
}

export function EditOrderForm({ order }: EditOrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const type = formData.get("type") as "cake" | "pasapalos";
      const description = formData.get("description") as string;
      const date = formData.get("date") as string;
      const time = formData.get("time") as string;
      const totalAmount = parseFloat(formData.get("totalAmount") as string);
      const paymentStatus = formData.get("paymentStatus") as "pending" | "paid" | "partial";
      const status = formData.get("status") as "pending" | "in_progress" | "ready" | "delivered" | "cancelled";

      await updateOrder(order.id, {
        type,
        description,
        date: new Date(date),
        time,
        totalAmount,
        paymentStatus,
        status,
      });

      router.push(`/dashboard/orders/${order.id}`);
    });
  }

  const formatDate = (date: Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Detalles del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select name="type" defaultValue={order.type}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cake">Pastel</SelectItem>
                <SelectItem value="pasapalos">Pasapalos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select name="status" defaultValue={order.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En Proceso</SelectItem>
                <SelectItem value="ready">Listo</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea name="description" defaultValue={order.description} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input name="date" type="date" defaultValue={formatDate(order.date)} required />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input name="time" type="time" defaultValue={order.time} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total ($)</Label>
              <Input
                name="totalAmount"
                type="number"
                step="0.01"
                defaultValue={order.totalAmount}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Pago</Label>
              <Select name="paymentStatus" defaultValue={order.paymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href={`/dashboard/orders/${order.id}`} className="flex-1">
          <Button type="button" variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
}
