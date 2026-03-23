import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SessionManager from "@/components/SessionManager";
import FaviconManager from "@/components/FaviconManager";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quikly Autoatención - Revoluciona tu atención al cliente",
  description:
    "Soluciones de autoatención inteligente para transformar la experiencia de tus clientes. Disponible 24/7 con IA conversacional.",
  generator: "v0.app",
  keywords: [
    "autoatención",
    "inteligencia artificial",
    "IA conversacional",
    "atención al cliente",
    "self-service",
  ],
  authors: [{ name: "Quikly" }],
  viewport: "width=device-width, initial-scale=1.0",
  icons: {
    apple: [{ url: "/favicons/light/apple-touch-icon.png" }],
    other: [{ url: "/favicons/site.webmanifest", rel: "manifest" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Por seguridad, dejamos un favicon por defecto */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicons/light/favicon-32x32.png"
        />
      </head>
      <body className="font-sans antialiased">
        <SessionManager />
        <FaviconManager />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
