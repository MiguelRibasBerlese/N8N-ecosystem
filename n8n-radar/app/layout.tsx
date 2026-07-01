import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseGrid — Monitor n8n em Tempo Real",
  description: "Dashboard de monitoramento de workflows n8n com alertas automáticos, mapa de dependências e execuções em tempo real.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%2306b6d4'/%3E%3Cpath d='M5 20h4l2.5-8 4 15 3-11 2 4h6.5' stroke='white' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Ccircle cx='27' cy='20' r='1.8' fill='white'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
