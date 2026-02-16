import type { Metadata } from "next";
import { Suspense } from "react";
import { Quicksand, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ToastProvider } from "@/components/toast-provider";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dulcesdlissa - Pedidos",
  description: "Sistema de pedidos para Dulcesdlissa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${quicksand.variable} ${nunito.variable}`}>
      <body className="font-body antialiased min-h-screen">
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
        <ToastProvider />
      </body>
    </html>
  );
}
