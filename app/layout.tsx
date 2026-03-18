import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ElevenLabsWidget } from "@/components/ElevenLabsWidget";

export const metadata: Metadata = {
  title: "VITAL Health — Copay Assistance",
  description: "Find savings on your specialty medication",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {children}
        <ElevenLabsWidget />
      </body>
    </html>
  );
}
