"use client";

import { SessionProvider } from "next-auth/react";
import PwaInstallBanner from "@/components/PwaInstallBanner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <PwaInstallBanner />
    </SessionProvider>
  );
}
