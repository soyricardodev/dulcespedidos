"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full border-0 shadow-lg">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-display font-semibold mb-2">Algo salió mal</h2>
          <p className="text-muted-foreground mb-6">
            Ocurrió un error inesperado. Por favor intenta de nuevo.
          </p>
          <Button onClick={reset}>
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
