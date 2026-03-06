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
    statusBarStyle: "black-translucent",
    title: "A-Level Rev",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-100`}>
        <Navbar />
        <main className="px-4 pt-4 pb-24 md:pb-6 max-w-3xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
