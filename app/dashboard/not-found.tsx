import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full border-0 shadow-lg">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-display font-semibold mb-2">Página no encontrada</h2>
          <p className="text-muted-foreground mb-6">
            La página que buscas no existe o ha sido movida.
          </p>
          <Link href="/dashboard">
            <Button>
              Volver al Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
