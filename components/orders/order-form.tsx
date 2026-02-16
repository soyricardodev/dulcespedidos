"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { createOrderAction } from "@/app/dashboard/orders/new/actions";

interface Client {
  id: number;
  name: string;
}

interface OrderFormProps {
  clients: Client[];
  userId: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="flex-1">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Crear Pedido
    </Button>
  );
}

export function OrderForm({ clients, userId }: OrderFormProps) {
  const router = useRouter();
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");

  const [clientId, setClientId] = useState("");
  const [needsTopper, setNeedsTopper] = useState(false);
  const [delegatedToNatalia, setDelegatedToNatalia] = useState(false);
  const [topperImages, setTopperImages] = useState<
    { file: File; preview: string; description: string }[]
  >([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const preview = URL.createObjectURL(file);
      setTopperImages((prev) => [...prev, { file, preview, description: "" }]);
    }
  };

  const removeImage = (index: number) => {
    setTopperImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateImageDescription = (index: number, description: string) => {
    setTopperImages((prev) => prev.map((img, i) => (i === index ? { ...img, description } : img)));
  };

  async function handleSubmit(formData: FormData) {
    // Add images to form data
    topperImages.forEach((img, index) => {
      formData.append(`image_${index}`, img.file);
      formData.append(`image_${index}_description`, img.description);
    });

    // Add userId
    formData.append("userId", userId);

    // If creating new client
    if (showNewClient && newClientName) {
      formData.append("newClientName", newClientName);
      formData.append("newClientPhone", newClientPhone);
      formData.append("newClientAddress", newClientAddress);
    }

    const result = await createOrderAction(formData);

    if (result.success) {
      router.push("/dashboard/orders");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showNewClient ? (
            <div className="space-y-4">
              <Select name="clientId" value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewClient(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cliente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Nombre del cliente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="Teléfono"
                />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Textarea
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="Dirección"
                />
              </div>
              <Button type="button" variant="ghost" onClick={() => setShowNewClient(false)}>
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Detalles del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select name="type" defaultValue="cake">
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
            <Label>Descripción</Label>
            <Textarea name="description" placeholder="Describe el pedido..." required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input name="time" type="time" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total ($)</Label>
              <Input name="totalAmount" type="number" step="0.01" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label>Pago</Label>
              <Select name="paymentStatus" defaultValue="pending">
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

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Topper</CardTitle>
            <Switch checked={needsTopper} onCheckedChange={setNeedsTopper} name="needsTopper" />
          </div>
        </CardHeader>
        {needsTopper && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Descripción del Topper</Label>
              <Textarea
                name="topperDescription"
                placeholder="Describe cómo debe verse el topper..."
                required={needsTopper}
              />
            </div>

            <div className="space-y-2">
              <Label>Ocasión</Label>
              <Input name="topperOccasion" placeholder="Ej: Anniversary, Birthday, etc." />
            </div>

            <div className="space-y-2">
              <Label>Precio (lo que le pagas a Natalia)</Label>
              <Input name="topperPrice" type="number" step="0.01" placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <Label>Imágenes de Referencia</Label>
              <div className="flex gap-2 flex-wrap">
                {topperImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${i}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <Input
                      value={img.description}
                      onChange={(e) => updateImageDescription(i, e.target.value)}
                      placeholder="Descripción"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Delegar a Natalia</Label>
              <Switch
                checked={delegatedToNatalia}
                onCheckedChange={setDelegatedToNatalia}
                name="delegatedToNatalia"
              />
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Cancelar
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}
