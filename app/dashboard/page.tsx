import { getSession } from '@/lib/session';
import { getDb } from '@/db';
import { users, orders } from '@/db/schema';
import { eq, gte } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingBag, 
  Scissors, 
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';

async function getStats(userId: string) {
  const db = getDb();
  
  const userRoles = await db.select().from(users).where(eq(users.id, userId));
  const role = userRoles[0]?.role ?? 'julissa';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [orderCount, todayOrders, totalRevenue] = await Promise.all([
    db.select().from(orders).where(eq(orders.userId, userId)),
    db.select().from(orders).where(gte(orders.createdAt, today)),
    db.select().from(orders).where(eq(orders.userId, userId)),
  ]);
  
  const pendingOrders = orderCount.filter(o => o.status === 'pending').length;
  const revenue = totalRevenue.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  
  return {
    role,
    totalOrders: orderCount.length,
    todayOrders: todayOrders.length,
    pendingOrders,
    revenue,
    needsToppers: orderCount.filter(o => o.needsTopper && !o.delegatedToNatalia).length,
  };
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const stats = await getStats(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">
          ¡Hola, {session.user.name}! 👋
        </h1>
        <p className="text-muted-foreground">
          {stats.role === 'julissa' ? 'Gestiona tus pedidos' : 'Preparando toppers'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pedidos Hoy
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>

        {stats.role === 'julissa' && (
          <>
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pedidos
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ingresos
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
              </CardContent>
            </Card>
          </>
        )}

        {stats.role === 'natalia' && (
          <>
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Toppers Pendientes
                </CardTitle>
                <Scissors className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.needsToppers}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
