import Link from "next/link";
import { getSession } from "@/lib/session";
import { getOrders } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Cake, Cookie, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  partial: "bg-orange-100 text-orange-800",
};

export default async function OrdersPage() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const orderList = await getOrders(session.user.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold">Pedidos</h1>
        <Link href="/dashboard/orders/new">
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Pedido
          </Button>
        </Link>
      </div>

      {orderList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Cake className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No hay pedidos todavía.
              <br />
              ¡Crea tu primer pedido!
            </p>
            <Link href="/dashboard/orders/new" className="mt-4">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Crear Pedido
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orderList.map((order) => (
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
                        <span className="font-medium truncate">
                          {order.clients?.name || "Cliente sin nombre"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {order.orders.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(order.orders.date).toLocaleDateString("es-ES")} -{" "}
                          {order.orders.time}
                        </span>
                        {order.orders.needsTopper && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Topper
                          </Badge>
                        )}
                        {order.orders.delegatedToNatalia && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            → Natalia
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${statusColors[order.orders.status]} border-0`}>
                        {order.orders.status === "in_progress"
                          ? "En Proceso"
                          : order.orders.status === "ready"
                            ? "Listo"
                            : order.orders.status === "delivered"
                              ? "Entregado"
                              : order.orders.status === "cancelled"
                                ? "Cancelado"
                                : "Pendiente"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${paymentColors[order.orders.paymentStatus]} border-0`}
                      >
                        {order.orders.paymentStatus === "partial"
                          ? "Parcial"
                          : order.orders.paymentStatus === "paid"
                            ? "Pagado"
                            : "Pendiente"}
                      </Badge>
                      <span className="text-sm font-semibold">${order.orders.totalAmount}</span>
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
