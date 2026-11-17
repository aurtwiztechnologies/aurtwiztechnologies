import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURTWIZ BUSINESS OS | Aurtwiz Technologies",
  description: "Internal Business Management Platform for Aurtwiz Technologies",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-zinc-950 text-zinc-100 antialiased dark">
      <body className="min-h-full flex flex-col font-sans bg-zinc-950 text-zinc-100 selection:bg-indigo-600 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
