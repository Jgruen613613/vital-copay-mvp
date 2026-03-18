import type { Metadata } from "next";
import "./globals.css";
import { ElevenLabsWidget } from "@/components/ElevenLabsWidget";

export const metadata: Metadata = {
  title: "VITAL Health — Copay Assistance",
  description: "Find savings on your specialty medication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {children}
        <ElevenLabsWidget />
      </body>
    </html>
  );
}
