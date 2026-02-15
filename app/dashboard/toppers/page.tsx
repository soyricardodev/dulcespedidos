'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';

interface Topper {
  id: number;
  orderId: number;
  description: string;
  occasion: string | null;
  price: number;
  isReady: boolean;
  createdAt: Date;
  updatedAt: Date;
  orders: {
    id: number;
    date: Date;
    time: string;
    description: string;
  };
  clients: {
    name: string;
  } | null;
  images: {
    id: number;
    imageUrl: string;
    description: string | null;
  }[];
}

export default function ToppersClient() {
  const [toppers, setToppers] = useState<Topper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/toppers')
      .then(res => res.json())
      .then(data => {
        setToppers(data.toppers || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const toggleReady = async (id: number, currentStatus: boolean) => {
    try {
      await fetch('/api/toppers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isReady: !currentStatus }),
      });
      setToppers(prev => 
        prev.map(t => 
          t.id === id ? { ...t, isReady: !currentStatus } : t
        )
      );
    } catch (error) {
      console.error('Error updating topper:', error);
    }
  };

  const groupedToppers = toppers.reduce((acc, t) => {
    const date = new Date(t.orders.date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {} as Record<string, Topper[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Toppers</h1>
        <p className="text-muted-foreground">Pedidos con toppers</p>
      </div>

      {toppers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              No hay toppers pendientes.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedToppers).map(([date, dateToppers]) => (
          <div key={date}>
            <h2 className="font-medium text-muted-foreground mb-3 capitalize">{date}</h2>
            <div className="space-y-3">
              {dateToppers.map((t) => (
                <Card key={t.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {t.clients?.name || 'Cliente sin nombre'}
                          </span>
                          {t.isReady ? (
                            <Badge className="bg-green-100 text-green-800 border-0">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Listo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Pendiente
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t.description}
                        </p>
                        {t.occasion && (
                          <p className="text-xs text-muted-foreground mb-2">
                            Ocasi&oacute;n: {t.occasion}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{t.orders.time}</span>
                          {t.price > 0 && (
                            <span className="ml-2 font-medium">
                              ${t.price}
                            </span>
                          )}
                        </div>
                        
                        {t.images && t.images.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                            {t.images.map((img) => (
                              <div key={img.id} className="flex-shrink-0">
                                <img
                                  src={img.imageUrl}
                                  alt={img.description || 'Referencia'}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                {img.description && (
                                  <p className="text-xs text-muted-foreground mt-1 max-w-16 truncate">
                                    {img.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant={t.isReady ? "outline" : "default"}
                        onClick={() => toggleReady(t.id, t.isReady)}
                      >
                        {t.isReady ? "Desmarcar" : "Marcar Listo"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
