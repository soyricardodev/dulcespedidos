import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-purple-50">
      <Card className="w-full max-w-sm shadow-xl border-0 text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-display">Acceso No Autorizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Debes iniciar sesión para acceder a esta página.</p>
          <Link href="/">
            <Button className="w-full">Ir al Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
