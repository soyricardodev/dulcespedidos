export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");
  
  // If it starts with 0, remove it and add 58 (Venezuela)
  if (cleaned.startsWith("0")) {
    return "58" + cleaned.substring(1);
  }
  
  // If it doesn't have country code, add 58
  if (!cleaned.startsWith("58") && cleaned.length === 10) {
    return "58" + cleaned;
  }
  
  return cleaned;
}

export function getWhatsAppUrl(phone: string, message?: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  const baseUrl = `https://wa.me/${formattedPhone}`;
  
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  
  return baseUrl;
}

export function generateOrderMessage(data: {
  orderId: number;
  clientName: string;
  type: "cake" | "pasapalos";
  description: string;
  date: string;
  time: string;
  totalAmount: number;
  topperDescription?: string;
}): string {
  const lines = [
    `🍰 *Pedido #${data.orderId}*`,
    `Hola ${data.clientName}! Confirmamos tu pedido:`,
    "",
    `📦 *Tipo:* ${data.type === "cake" ? "Pastel" : "Pasapalos"}`,
    `📝 *Descripción:* ${data.description}`,
    `📅 *Fecha:* ${data.date}`,
    `⏰ *Hora:* ${data.time}`,
    `💰 *Total:* $${data.totalAmount.toFixed(2)}`,
  ];

  if (data.topperDescription) {
    lines.push("", `✂️ *Topper:* ${data.topperDescription}`);
  }

  lines.push("", "¡Gracias por tu pedido! 💕");

  return lines.join("\n");
}
