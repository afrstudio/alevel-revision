import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A-Level Revision",
  description: "A-Level Maths, Biology & Chemistry revision app",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "A-Level Rev",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen bg-zinc-50 pb-24">
        <Navbar />
        <main className="px-5 py-5 max-w-md mx-auto sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
          {children}
        </main>
      </body>
    </html>
  );
}
