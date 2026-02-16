import { getDashboardStats, getRevenueByMonth, getOrdersByStatus, getTopClients } from "@/lib/actions";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";

export async function AnalyticsCards() {
  const session = await getSession();
  if (!session?.user) return null;

  const stats = await getDashboardStats(session.user.id);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pedidos Hoy</p>
              <p className="text-2xl font-bold">{stats.todayOrders}</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Ingresos del Mes</p>
              <p className="text-2xl font-bold">${stats.monthRevenue.toFixed(0)}</p>
              {stats.revenueChange !== 0 && (
                <div className={`flex items-center text-xs ${stats.revenueChange > 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.revenueChange > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(stats.revenueChange).toFixed(0)}%
                </div>
              )}
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pagos Pendientes</p>
              <p className="text-2xl font-bold">${stats.pendingPayments.toFixed(0)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export async function RevenueChart() {
  const session = await getSession();
  if (!session?.user) return null;

  const data = await getRevenueByMonth(session.user.id, 6);
  const maxValue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Ingresos por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-40">
          {data.map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-primary/20 rounded-t-sm transition-all hover:bg-primary/40"
                style={{
                  height: `${(item.revenue / maxValue) * 100}%`,
                  minHeight: item.revenue > 0 ? "4px" : "0",
                }}
              />
              <span className="text-xs text-muted-foreground">{item.month}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-sm">
          {data.slice(-1).map((item) => (
            <div key={item.month}>
              <span className="text-muted-foreground">Último mes: </span>
              <span className="font-semibold">${item.revenue.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export async function StatusChart() {
  const session = await getSession();
  if (!session?.user) return null;

  const data = await getOrdersByStatus(session.user.id);
  const total = Object.values(data).reduce((sum, v) => sum + v, 0);
  const maxValue = Math.max(...Object.values(data), 1);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-400",
    in_progress: "bg-blue-400",
    ready: "bg-green-400",
    delivered: "bg-gray-400",
    cancelled: "bg-red-400",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    in_progress: "En Proceso",
    ready: "Listo",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Estado de Pedidos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(data).map(([status, count]) => (
          <div key={status} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{statusLabels[status]}</span>
              <span className="font-medium">{count}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${statusColors[status]} rounded-full transition-all`}
                style={{ width: `${(count / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export async function TopClientsList() {
  const session = await getSession();
  if (!session?.user) return null;

  const clients = await getTopClients(session.user.id, 5);

  if (clients.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Clientes Frecuentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clients.map((client, index) => (
            <div key={client.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.orders} pedidos</p>
                </div>
              </div>
              <div className="text-sm font-semibold">${client.revenue.toFixed(0)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
