import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const viewport = {
  themeColor: "#0F673D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "United Vision Club",
  description: "Financial Tracking & Club Management App",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UVC",
  }
};

import AppDownloadPrompt from "@/components/dashboard/AppDownloadPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', sans-serif" }} suppressHydrationWarning>
        <Providers>
          {children}
          <AppDownloadPrompt />
        </Providers>
      </body>
    </html>
  );
}
