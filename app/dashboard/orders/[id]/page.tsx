import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder, deleteOrder } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Cake,
  Cookie,
  Clock,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Scissors,
  Trash2,
  Edit,
  CheckCircle,
} from "lucide-react";
import { DeleteOrderButton } from "./delete-button";

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

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En Proceso",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const paymentLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  partial: "Parcial",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(parseInt(id));

  if (!order) {
    notFound();
  }

  const { orders: orderData, clients: clientData, toppers: topperData } = order;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-semibold flex items-center gap-2">
              {orderData.type === "cake" ? (
                <Cake className="w-6 h-6 text-pink-400" />
              ) : (
                <Cookie className="w-6 h-6 text-amber-400" />
              )}
              Pedido #{orderData.id}
            </h1>
            <p className="text-muted-foreground">{clientData?.name || "Cliente sin nombre"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/orders/${orderData.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
          <DeleteOrderButton orderId={orderData.id} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Detalles del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estado</span>
              <Badge className={`${statusColors[orderData.status]} border-0`}>
                {statusLabels[orderData.status]}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pago</span>
              <Badge className={`${paymentColors[orderData.paymentStatus]} border-0`}>
                {paymentLabels[orderData.paymentStatus]}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{new Date(orderData.date).toLocaleDateString("es-ES")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{orderData.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span>${orderData.totalAmount.toFixed(2)}</span>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-1">Descripción</p>
              <p className="text-sm text-muted-foreground">{orderData.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="font-medium">{clientData?.name || "Sin nombre"}</div>
            {clientData?.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a href={`tel:${clientData.phone}`} className="hover:text-primary">
                  {clientData.phone}
                </a>
              </div>
            )}
            {clientData?.address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{clientData.address}</span>
              </div>
            )}
            {clientData?.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notas:</p>
                <p>{clientData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {topperData && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Topper
              </CardTitle>
              {topperData.isReady ? (
                <Badge className="bg-green-100 text-green-800 border-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Listo
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600">
                  Pendiente
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Descripción</p>
              <p className="text-sm text-muted-foreground">{topperData.description}</p>
            </div>
            {topperData.occasion && (
              <div>
                <p className="text-sm font-medium mb-1">Ocasión</p>
                <p className="text-sm text-muted-foreground">{topperData.occasion}</p>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm font-semibold">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span>Precio: ${topperData.price.toFixed(2)}</span>
            </div>
            {topperData.images && topperData.images.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Imágenes de Referencia</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {topperData.images.map((img) => (
                    <div key={img.id} className="flex-shrink-0">
                      <img
                        src={img.imageUrl}
                        alt={img.description || "Referencia"}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      {img.description && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-24 truncate">
                          {img.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
