import { getSession } from "@/lib/session";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const db = getDb();
  const [userData] = await db.select().from(users).where(eq(users.id, session.user.id));
  const role = userData?.role ?? "julissa";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Ajustes</h1>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium">{session.user.name}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span>{session.user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Rol:</span>
            <Badge variant={role === "julissa" ? "default" : "secondary"}>
              {role === "julissa" ? "Administrador" : "Topper Designer"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cierra sesión en tu cuenta. Podrás volver a iniciar sesión cuando lo desees.
          </p>
          <SignOutButton />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Acerca de</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Dulcesdlissa - Sistema de Gestión de Pedidos
          </p>
          <p className="text-xs text-muted-foreground">
            Versión 1.0.0
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
