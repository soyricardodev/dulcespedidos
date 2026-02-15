'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Upload, X } from 'lucide-react';

interface Client {
  id: number;
  name: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState<'cake' | 'pasapalos'>('cake');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'partial'>('pending');
  const [needsTopper, setNeedsTopper] = useState(false);
  const [delegatedToNatalia, setDelegatedToNatalia] = useState(false);
  
  const [topperDescription, setTopperDescription] = useState('');
  const [topperOccasion, setTopperOccasion] = useState('');
  const [topperPrice, setTopperPrice] = useState('');
  const [topperImages, setTopperImages] = useState<{ file: File; preview: string; description: string }[]>([]);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClients(data.clients || []))
      .catch(console.error);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const preview = URL.createObjectURL(file);
      setTopperImages(prev => [...prev, { file, preview, description: '' }]);
    }
  };

  const removeImage = (index: number) => {
    setTopperImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageDescription = (index: number, description: string) => {
    setTopperImages(prev => prev.map((img, i) => 
      i === index ? { ...img, description } : img
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalClientId = clientId;
      
      if (showNewClient && newClientName) {
        const clientRes = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newClientName,
            phone: newClientPhone,
            address: newClientAddress,
          }),
        });
        const clientData = await clientRes.json();
        finalClientId = clientData.client.id;
      }

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: parseInt(finalClientId),
          type,
          description,
          date,
          time,
          totalAmount: parseFloat(totalAmount),
          paymentStatus,
          needsTopper,
          delegatedToNatalia: needsTopper && delegatedToNatalia,
        }),
      });

      const orderData = await orderRes.json();

      if (needsTopper && orderData.order) {
        const topperRes = await fetch('/api/toppers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.order.id,
            description: topperDescription,
            occasion: topperOccasion,
            price: parseFloat(topperPrice) || 0,
          }),
        });

        const topperData = await topperRes.json();

        if (topperData.topper && topperImages.length > 0) {
          for (const img of topperImages) {
            const formData = new FormData();
            formData.append('file', img.file);
            formData.append('topperId', topperData.topper.id);
            formData.append('description', img.description);

            await fetch('/api/toppers/images', {
              method: 'POST',
              body: formData,
            });
          }
        }
      }

      router.push('/dashboard/orders');
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Nuevo Pedido</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showNewClient ? (
              <div className="space-y-4">
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
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
                    onChange={e => setNewClientName(e.target.value)}
                    placeholder="Nombre del cliente"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={newClientPhone}
                    onChange={e => setNewClientPhone(e.target.value)}
                    placeholder="Teléfono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <Textarea
                    value={newClientAddress}
                    onChange={e => setNewClientAddress(e.target.value)}
                    placeholder="Dirección"
                  />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowNewClient(false)}
                >
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
              <Select value={type} onValueChange={v => setType(v as 'cake' | 'pasapalos')}>
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
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe el pedido..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={e => setTotalAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Pago</Label>
                <Select value={paymentStatus} onValueChange={v => setPaymentStatus(v as any)}>
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
              <Switch
                checked={needsTopper}
                onCheckedChange={setNeedsTopper}
              />
            </div>
          </CardHeader>
          {needsTopper && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Descripción del Topper</Label>
                <Textarea
                  value={topperDescription}
                  onChange={e => setTopperDescription(e.target.value)}
                  placeholder="Describe cómo debe verse el topper..."
                  required={needsTopper}
                />
              </div>

              <div className="space-y-2">
                <Label>Ocasión</Label>
                <Input
                  value={topperOccasion}
                  onChange={e => setTopperOccasion(e.target.value)}
                  placeholder="Ej: Anniversary, Birthday, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Precio (lo que le pagas a Natalia)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={topperPrice}
                  onChange={e => setTopperPrice(e.target.value)}
                  placeholder="0.00"
                />
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
                        onChange={e => updateImageDescription(i, e.target.value)}
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

              {needsTopper && (
                <div className="flex items-center justify-between">
                  <Label>Delegar a Natalia</Label>
                  <Switch
                    checked={delegatedToNatalia}
                    onCheckedChange={setDelegatedToNatalia}
                  />
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Pedido
          </Button>
        </div>
      </form>
    </div>
  );
}
