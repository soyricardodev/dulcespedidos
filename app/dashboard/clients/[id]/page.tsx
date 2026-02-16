import { notFound } from "next/navigation";
import Link from "next/link";
import { getClient, getClientOrders, deleteClient } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Cake,
  Cookie,
  Clock,
  Calendar,
} from "lucide-react";
import { DeleteClientButton } from "./delete-button";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En Proceso",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(parseInt(id));

  if (!client) {
    notFound();
  }

  const orders = await getClientOrders(client.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-semibold">{client.name}</h1>
            <p className="text-muted-foreground">Cliente</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/clients/${client.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
          <DeleteClientButton clientId={client.id} />
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Información</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {client.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a href={`tel:${client.phone}`} className="hover:text-primary">
                {client.phone}
              </a>
            </div>
          )}
          {client.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span>{client.address}</span>
            </div>
          )}
          {client.notes && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="font-medium mb-1">Notas:</p>
                <p className="text-muted-foreground">{client.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Historial de Pedidos ({orders.length})</h2>
        {orders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground text-sm">No hay pedidos para este cliente</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.orders.id} href={`/dashboard/orders/${order.orders.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {order.orders.type === "cake" ? (
                            <Cake className="w-4 h-4 text-pink-400" />
                          ) : (
                            <Cookie className="w-4 h-4 text-amber-400" />
                          )}
                          <span className="font-medium">Pedido #{order.orders.id}</span>
                          <Badge className={`${statusColors[order.orders.status]} border-0 text-xs`}>
                            {statusLabels[order.orders.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {order.orders.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(order.orders.date).toLocaleDateString("es-ES")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{order.orders.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">${order.orders.totalAmount}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
