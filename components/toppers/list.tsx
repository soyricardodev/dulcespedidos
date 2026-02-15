import { getToppers } from '@/lib/actions';
import { getSession } from '@/lib/session';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';
import { ToggleTopperButton } from '@/components/toppers/toggle-button';

export async function ToppersList() {
  const session = await getSession();
  
  if (!session?.user) {
    return null;
  }

  const toppers = await getToppers();

  // Group by date
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
  }, {} as Record<string, typeof toppers>);

  if (toppers.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No hay toppers pendientes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedToppers).map(([date, dateToppers]) => (
        <div key={date}>
          <h2 className="font-medium text-muted-foreground mb-3 capitalize">{date}</h2>
          <div className="space-y-3">
            {dateToppers.map((t) => (
              <Card key={t.toppers.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {t.clients?.name || 'Cliente sin nombre'}
                        </span>
                        {t.toppers.isReady ? (
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
                        {t.toppers.description}
                      </p>
                      {t.toppers.occasion && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Ocasión: {t.toppers.occasion}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>{t.orders.time}</span>
                        {t.toppers.price > 0 && (
                          <span className="ml-2 font-medium">
                            ${t.toppers.price}
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
                    
                    <ToggleTopperButton 
                      id={t.toppers.id} 
                      isReady={t.toppers.isReady} 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
