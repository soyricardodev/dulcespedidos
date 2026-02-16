import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { getDb } from "@/db";
import { users, orders } from "@/db/schema";
import { eq, gte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Scissors, TrendingUp, Calendar, DollarSign } from "lucide-react";
import {
  AnalyticsCards,
  RevenueChart,
  StatusChart,
  TopClientsList,
} from "@/components/dashboard/analytics";

async function getRole(userId: string) {
  const db = getDb();
  const userRoles = await db.select().from(users).where(eq(users.id, userId));
  return userRoles[0]?.role ?? "julissa";
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const role = await getRole(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">¡Hola, {session.user.name}! 👋</h1>
        <p className="text-muted-foreground">
          {role === "julissa" ? "Gestiona tus pedidos" : "Preparando toppers"}
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <AnalyticsCards />
      </Suspense>

      {role === "julissa" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Suspense
            fallback={
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="h-40 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            }
          >
            <RevenueChart />
          </Suspense>

          <Suspense
            fallback={
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="h-40 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            }
          >
            <StatusChart />
          </Suspense>
        </div>
      )}

      {role === "julissa" && (
        <Suspense
          fallback={
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="h-40 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          }
        >
          <TopClientsList />
        </Suspense>
      )}
    </div>
  );
}
