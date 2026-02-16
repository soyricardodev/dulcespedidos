"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
import { toggleTopperStatus } from "@/lib/actions";

interface ToggleTopperButtonProps {
  id: number;
  isReady: boolean;
}

export function ToggleTopperButton({ id, isReady }: ToggleTopperButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTopperStatus(id, !isReady);
    });
  };

  return (
    <Button
      size="sm"
      variant={isReady ? "outline" : "default"}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <Clock className="w-4 h-4 animate-spin" />
      ) : isReady ? (
        <>
          <CheckCircle className="w-4 h-4 mr-1" />
          Desmarcar
        </>
      ) : (
        <>
          <Clock className="w-4 h-4 mr-1" />
          Marcar Listo
        </>
      )}
    </Button>
  );
}
