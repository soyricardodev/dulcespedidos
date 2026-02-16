import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard-nav";
import { MobileHeader } from "@/components/mobile-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    unauthorized();
  }

  const db = getDb();
  const userRoles = await db.select().from(users).where(eq(users.id, session.user.id));
  const role = userRoles[0]?.role ?? "julissa";

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader role={role} />
      <div className="flex">
        <DashboardNav role={role} />
        <main className="flex-1 p-4 pb-20 md:pb-4 md:ml-64">{children}</main>
      </div>
    </div>
  );
}
