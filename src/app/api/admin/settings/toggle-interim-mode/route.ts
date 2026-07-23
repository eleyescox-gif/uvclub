import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }

    const currentRole = (session.user as any).role;
    if (currentRole !== "ADMIN" && currentRole !== "PRESIDENT" && currentRole !== "SECRETARY" && currentRole !== "CONTROLLER") {
      return NextResponse.json({ error: "পারমিশন নেই" }, { status: 403 });
    }

    const { noCommitteeMode } = await req.json();

    // If turning OFF control mode, ensure an elected committee exists
    if (!noCommitteeMode) {
      const committeeCount = await prisma.committee.count();
      if (committeeCount === 0) {
        return NextResponse.json({ 
          error: "কন্ট্রোল মোড বন্ধ করতে হলে অবশ্যই একটি নির্বাচিত পরিচালনা কমিটি থাকতে হবে! দয়া করে আগে নিচে পরিচালনা কমিটি গঠন করুন।" 
        }, { status: 400 });
      }
    }

    const updatedSettings = await (prisma as any).clubSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        name: "United Vision",
        noCommitteeMode: Boolean(noCommitteeMode)
      },
      update: {
        noCommitteeMode: Boolean(noCommitteeMode)
      }
    });

    return NextResponse.json({ success: true, noCommitteeMode: updatedSettings.noCommitteeMode });
  } catch (error: any) {
    console.error("Toggle interim mode error:", error);
    return NextResponse.json({ error: error.message || "অন্তরবর্তীকালীন মোড পরিবর্তন করতে ব্যর্থ" }, { status: 500 });
  }
}
