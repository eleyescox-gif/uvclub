import prisma from "@/lib/prisma";

export interface ClubInfo {
  name: string;
  address: string;
  logo: string | null;
  paidLogo: string | null;
  watermarkLogo: string | null;
}

export async function getClubInfo(): Promise<ClubInfo> {
  const defaults: ClubInfo = {
    name: "ইউনাইটেড ভিশন ক্লাব",
    address: "বরইতলী, চকরিয়া, কক্সবাজার।",
    logo: null,
    paidLogo: null,
    watermarkLogo: null,
  };

  try {
    if (!prisma.clubSettings) return defaults;
    const cs = await (prisma.clubSettings as any).findUnique({ where: { id: "singleton" } });
    if (!cs) return defaults;
    return {
      name: cs.name || defaults.name,
      address: cs.address || defaults.address,
      logo: cs.logo || null,
      paidLogo: cs.paidLogo || null,
      watermarkLogo: cs.watermarkLogo || null,
    };
  } catch {
    return defaults;
  }
}
