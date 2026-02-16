"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "@/lib/client";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    router.push("/");
  }

  return (
    <Button variant="destructive" onClick={handleSignOut} disabled={isSigningOut}>
      {isSigningOut ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4 mr-2" />
      )}
      Cerrar Sesión
    </Button>
  );
}
