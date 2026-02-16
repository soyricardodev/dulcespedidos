import Link from "next/link";
import { getClients } from "@/lib/actions";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, MapPin, Users } from "lucide-react";

export default async function ClientsPage() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const clients = await getClients();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold">Clientes</h1>
        <Link href="/dashboard/clients/new">
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No hay clientes todavía.<br />
              ¡Agrega tu primer cliente!
            </p>
            <Link href="/dashboard/clients/new" className="mt-4">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Cliente
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{client.name}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{client.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
