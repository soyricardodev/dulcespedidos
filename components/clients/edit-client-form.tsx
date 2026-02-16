"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { updateClient } from "@/lib/actions";

interface Client {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

interface EditClientFormProps {
  client: Client;
}

export function EditClientForm({ client }: EditClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateClient(client.id, {
        name: formData.get("name") as string,
        phone: (formData.get("phone") as string) || undefined,
        address: (formData.get("address") as string) || undefined,
        notes: (formData.get("notes") as string) || undefined,
      });
      router.push(`/dashboard/clients/${client.id}`);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input name="name" defaultValue={client.name} required />
          </div>

          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input name="phone" type="tel" defaultValue={client.phone || ""} />
          </div>

          <div className="space-y-2">
            <Label>Dirección</Label>
            <Textarea name="address" defaultValue={client.address || ""} />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea name="notes" defaultValue={client.notes || ""} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href={`/dashboard/clients/${client.id}`} className="flex-1">
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
