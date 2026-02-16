"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="flex-1">
      {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      Crear Cliente
    </Button>
  );
}

export default function NewClientPage() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    await createClient({
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    });
    router.push("/dashboard/clients");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-semibold">Nuevo Cliente</h1>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input name="name" placeholder="Nombre del cliente" required />
            </div>

            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input name="phone" type="tel" placeholder="+58 412 1234567" />
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Textarea name="address" placeholder="Dirección del cliente" />
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea name="notes" placeholder="Notas adicionales..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Link href="/dashboard/clients" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
