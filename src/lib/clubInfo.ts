import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export interface ClubInfo {
  name: string;
  address: string;
  logo: string | null;
  paidLogo: string | null;
  watermarkLogo: string | null;
}

const defaults: ClubInfo = {
  name: "ইউনাইটেড ভিশন ক্লাব",
  address: "বরইতলী, চকরিয়া, কক্সবাজার।",
  logo: "/logo.jpg",
  paidLogo: "/paid_seal.png",
  watermarkLogo: "/logo.jpg",
};

export const getClubInfo = unstable_cache(
  async (): Promise<ClubInfo> => {
    try {
      if (!prisma.clubSettings) return defaults;
      const cs = await (prisma.clubSettings as any).findUnique({ where: { id: "singleton" } });
      if (!cs) return defaults;
      return {
        name: cs.name || defaults.name,
        address: cs.address || defaults.address,
        logo: cs.logo || defaults.logo,
        paidLogo: cs.paidLogo || defaults.paidLogo,
        watermarkLogo: cs.watermarkLogo || cs.logo || defaults.watermarkLogo,
      };
    } catch {
      return defaults;
    }
  },
  ["club-info-singleton"],
  { revalidate: 3600, tags: ["club-settings"] }
);
