import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EdgeCare-5G | AI Healthcare Monitoring",
  description: "Real-time AI-powered healthcare monitoring on the edge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-mesh`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          toastOptions={{
            style: {
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}
