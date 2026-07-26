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

    const userMobile = (session.user as any).mobile;
    const currentRole = (session.user as any).role;
    
    // ONLY Controller (01812000109) or CONTROLLER/ADMIN can toggle interim mode
    if (userMobile !== "01812000109" && currentRole !== "CONTROLLER" && currentRole !== "ADMIN") {
      return NextResponse.json({ error: "কেবলমাত্র কন্ট্রোলারই মোড পরিবর্তন করতে পারবেন।" }, { status: 403 });
    }

    const { noCommitteeMode } = await req.json();

    // If turning ON control mode (handing over to Controller)
    if (noCommitteeMode) {
      const userId = (session.user as any).id;
      await prisma.user.update({
        where: { id: userId },
        data: { role: "CONTROLLER", activeStatus: true }
      });
    } else {
      // If turning OFF control mode (handing over to committee)
      const committeeMembers = await prisma.committee.findMany();

      if (committeeMembers.length === 0) {
        return NextResponse.json({ 
          error: "কন্ট্রোল মোড বন্ধ করতে হলে অবশ্যই একটি নির্বাচিত পরিচালনা কমিটি থাকতে হবে! দয়া করে আগে পরিচালনা কমিটি গঠন করে পদবী অর্পণ করুন।" 
        }, { status: 400 });
      }

      // Handover: Update non-permanent controller users, but ALWAYS KEEP 01812000109 as CONTROLLER
      const controllerUsers = await prisma.user.findMany({
        where: { 
          role: "CONTROLLER",
          mobile: { not: "01812000109" }
        },
        include: { committeeRole: true }
      });

      for (const u of controllerUsers) {
        let restoredRole = "MEMBER";
        if (u.committeeRole) {
          const desig = u.committeeRole.designation.toLowerCase();
          if (desig.includes("সভাপতি") || desig.includes("president")) restoredRole = "PRESIDENT";
          else if (desig.includes("সম্পাদক") || desig.includes("secretary")) restoredRole = "SECRETARY";
          else if (desig.includes("ক্যাশ") || desig.includes("cashier")) restoredRole = "CASHIER";
          else if (desig.includes("অ্যাডমিন") || desig.includes("admin")) restoredRole = "ADMIN";
        }

        await prisma.user.update({
          where: { id: u.id },
          data: { role: restoredRole }
        });
      }
    }

    // Always ensure 01812000109 is CONTROLLER in database
    await prisma.user.updateMany({
      where: { mobile: "01812000109" },
      data: { role: "CONTROLLER", activeStatus: true }
    });

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
