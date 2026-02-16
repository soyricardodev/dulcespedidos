"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Share2 } from "lucide-react";
import { getWhatsAppUrl, generateOrderMessage } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  phone?: string | null;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  orderData?: {
    orderId: number;
    clientName: string;
    type: "cake" | "pasapalos";
    description: string;
    date: string;
    time: string;
    totalAmount: number;
    topperDescription?: string;
  };
}

export function WhatsAppButton({ 
  phone, 
  variant = "outline", 
  size = "sm",
  children,
  orderData 
}: WhatsAppButtonProps) {
  if (!phone) return null;

  const message = orderData 
    ? generateOrderMessage({
        ...orderData,
        date: new Date(orderData.date).toLocaleDateString("es-ES"),
      })
    : undefined;

  const url = getWhatsAppUrl(phone, message);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => window.open(url, "_blank")}
    >
      {children || (
        <>
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </>
      )}
    </Button>
  );
}

export function ShareOrderButton({ orderData }: { orderData: WhatsAppButtonProps["orderData"] }) {
  if (!orderData) return null;

  const message = generateOrderMessage({
    ...orderData,
    date: new Date(orderData.date).toLocaleDateString("es-ES"),
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pedido #${orderData.orderId}`,
          text: message,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(message);
      alert("Mensaje copiado al portapapeles");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      <Share2 className="w-4 h-4 mr-2" />
      Compartir
    </Button>
  );
}
