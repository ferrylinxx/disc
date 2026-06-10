import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.APP_URL ?? "https://disc.fgarola.es";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "DISC GESEM",
  title: {
    default: "DISC GESEM · Autoconocimiento conductual",
    template: "%s · DISC GESEM",
  },
  description:
    "Plataforma de autoconocimiento conductual y desarrollo de equipos GESEM.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "DISC GESEM",
    title: "DISC GESEM · Autoconocimiento conductual",
    description:
      "Cuestionario de estilos conductuales para el desarrollo de personas y equipos.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DISC GESEM · Autoconocimiento conductual",
    description:
      "Cuestionario de estilos conductuales para el desarrollo de personas y equipos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="app-backdrop" aria-hidden />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
