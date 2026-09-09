import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import AppDownloadPrompt from "@/components/dashboard/AppDownloadPrompt";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
  variable: "--font-hind-siliguri",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`h-full antialiased ${hindSiliguri.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`min-h-full flex flex-col ${hindSiliguri.className}`}
        style={{ fontFamily: "var(--font-hind-siliguri), 'Noto Sans Bengali', 'SolaimanLipi', sans-serif" }}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <AppDownloadPrompt />
        </Providers>
      </body>
    </html>
  );
}
